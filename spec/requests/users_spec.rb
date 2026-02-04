require 'rails_helper'

RSpec.describe 'Users', type: :request do
  let(:user_id) { SecureRandom.uuid }
  let(:user_email) { 'testuser@example.com' }
  let(:user_password) { 'password123' }
  let(:user_lang) { 'en' }

  before do
    # Clean up test data
    Repos::Users.delete_many(email: user_email)

    # Create a validated test user
    Repos::Users.save({
      id: user_id,
      email: user_email,
      password: BCrypt::Password.create(user_password),
      lang: user_lang,
      validation: true,
      created_at: Time.now.to_i
    })
  end

  describe 'Protected Routes - require login' do
    context 'GET /users without authentication' do
      it 'returns unauthorized error' do
        get users_path

        expect(response).to have_http_status(:ok) # Pard exceptions return 200
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('unauthorized')
      end
    end

    context 'POST /users/header without authentication' do
      it 'returns unauthorized error' do
        post '/users/header'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('unauthorized')
      end
    end
  end

  describe 'Password Modification' do
    before do
      # Login first to establish session
      post '/login', params: {
        email: user_email,
        password: user_password
      }
    end

    context 'POST /users/modify_password with valid password' do
      it 'updates user password' do
        new_password = 'newpassword123'

        post '/users/modify_password', params: {
          password: new_password
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')

        # Verify new password works
        post '/logout'
        post '/login', params: {
          email: user_email,
          password: new_password
        }

        expect(response).to have_http_status(:ok)
        login_json = JSON.parse(response.body, symbolize_names: true)
        expect(login_json[:status]).to eq('success')
      end
    end

    context 'POST /users/modify_password with short password' do
      it 'returns error for invalid password' do
        post '/users/modify_password', params: {
          password: '12345' # Less than 6 characters
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('incorrect_password')
      end
    end
  end

  describe 'Language Modification' do
    context 'POST /modify_lang without authentication' do
      it 'returns success (allows anonymous language preference)' do
        post '/modify_lang', params: { lang: 'es' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'POST /modify_lang with authentication' do
      before do
        post '/login', params: {
          email: user_email,
          password: user_password
        }
      end

      it 'updates user language preference' do
        post '/modify_lang', params: { lang: 'es' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')

        # Verify language was updated
        user = Repos::Users.get_by_id(user_id)
        expect(user[:lang]).to eq('es')
      end
    end

    context 'POST /modify_lang with invalid language' do
      it 'returns error for unsupported language' do
        post '/modify_lang', params: { lang: 'invalid' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('invalid_language')
      end
    end
  end

  describe 'User Interests' do
    before do
      post '/login', params: {
        email: user_email,
        password: user_password
      }
    end

    context 'POST /users/save_interests' do
      it 'saves user interests' do
        interests = ['music', 'theatre', 'dance']

        post '/users/save_interests', params: {
          interests: interests
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'POST /users/save_interests without authentication' do
      before { post '/logout' }

      it 'returns success without saving (graceful handling)' do
        post '/users/save_interests', params: {
          interests: ['music']
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end
  end

  describe 'Get User Email' do
    before do
      post '/login', params: {
        email: user_email,
        password: user_password
      }
    end

    context 'GET /users/get_user_email' do
      it 'returns current user email' do
        get '/users/get_user_email'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:user_email]).to eq(user_email)
      end
    end
  end

  describe 'User Account Deletion' do
    before do
      post '/login', params: {
        email: user_email,
        password: user_password
      }
    end

    context 'POST /users/delete_user' do
      it 'deletes user account and clears session' do
        post '/users/delete_user'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')

        # Verify user was deleted
        expect(Repos::Users.exists?(id: user_id)).to be false

        # Verify session was cleared
        get '/login'
        session_json = JSON.parse(response.body, symbolize_names: true)
        expect(session_json[:logged_in]).to be false
      end
    end
  end

  describe 'User Header Data' do
    let(:profile_id) { SecureRandom.uuid }

    before do
      # Create a test profile owned by user
      Repos::Profiles.save({
        id: profile_id,
        name: 'Test Profile',
        owner: user_id,
        created_at: Time.now.to_i
      })

      post '/login', params: {
        email: user_email,
        password: user_password
      }
    end

    context 'POST /users/header' do
      it 'returns user profiles, events, and admin status' do
        post '/users/header'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json).to have_key(:profiles)
        expect(json).to have_key(:events)
        expect(json).to have_key(:admin)
        expect(json).to have_key(:interests)
      end
    end
  end
end
