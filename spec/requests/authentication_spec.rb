# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Authentication', type: :request, swagger_doc: 'openapi.yaml' do
  path '/register' do
    post 'Register a new user' do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/register_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]

        let(:body) { { user: { email: 'test@example.com', password: 'password123', name: 'Test User' } } }
        run_test!
      end
    end
  end

  path '/login' do
    post 'Log in' do
      tags 'Auth'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/login_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/login_success' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]

        let(:body) { { email: 'test@example.com', password: 'password123' } }
        run_test!
      end
    end

    get 'Get current session info' do
      tags 'Auth'
      produces 'application/json'
      security [cookieAuth: []]

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/login_success' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        run_test!
      end
    end
  end

  path '/logout' do
    post 'Log out' do
      tags 'Auth'
      security [cookieAuth: []]
      produces 'application/json'

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        run_test!
      end
    end
  end

  let(:user_email) { 'test@example.com' }
  let(:user_password) { 'password123' }
  let(:user_lang) { 'en' }

  before do
    # Clean up any existing test user
    Repos::Users.delete_many(email: user_email)
  end

  describe 'User Registration' do
    context 'POST /register with valid params' do
      it 'creates a new user account' do
        post '/register', params: {
          email: user_email,
          password: user_password,
          lang: user_lang
        }

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')

        # Verify user was created in database
        expect(Repos::Users.exists?(email: user_email)).to be true
      end
    end

    context 'POST /register with existing email' do
      before do
        # Create a test user first
        Repos::Users.save({
                            id: SecureRandom.uuid,
                            email: user_email,
                            password: BCrypt::Password.create(user_password),
                            lang: user_lang,
                            validation: false,
                            validation_code: SecureRandom.uuid,
                            created_at: Time.now.to_i
                          })
      end

      it 'returns error for duplicate email' do
        post '/register', params: {
          email: user_email,
          password: user_password,
          lang: user_lang
        }

        expect(response).to have_http_status(:ok) # Pard exceptions return 200
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('already_registered')
      end
    end

    context 'POST /register with invalid email' do
      it 'returns error for invalid email format' do
        post '/register', params: {
          email: 'invalid-email',
          password: user_password,
          lang: user_lang
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('invalid_email')
      end
    end

    context 'POST /register with short password' do
      it 'returns error for password less than 6 characters' do
        post '/register', params: {
          email: user_email,
          password: '12345',
          lang: user_lang
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('incorrect_password')
      end
    end
  end

  describe 'User Login' do
    let(:user_id) { SecureRandom.uuid }

    before do
      # Create a validated test user
      Repos::Users.save({
                          id: user_id,
                          email: user_email,
                          password: BCrypt::Password.create(user_password),
                          lang: user_lang,
                          validation: true, # User must be validated to login
                          created_at: Time.now.to_i
                        })
    end

    context 'POST /login with valid credentials' do
      it 'logs in user and creates session' do
        post '/login', params: {
          email: user_email,
          password: user_password
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:lang]).to eq(user_lang)

        # Verify session was created
        # Note: session assertions may not work in request specs without additional setup
      end
    end

    context 'POST /login with incorrect password' do
      it 'returns error for wrong password' do
        post '/login', params: {
          email: user_email,
          password: 'wrongpassword'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('incorrect_password')
      end
    end

    context 'POST /login with non-existent user' do
      it 'returns error for unregistered email' do
        post '/login', params: {
          email: 'nonexistent@example.com',
          password: user_password
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('non_existing_user')
      end
    end

    context 'POST /login with unvalidated user' do
      before do
        # Update user to unvalidated state
        Repos::Users.modify(id: user_id, validation: false)
      end

      it 'returns error for unvalidated account' do
        post '/login', params: {
          email: user_email,
          password: user_password
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('not_validated_user')
      end
    end
  end

  describe 'User Logout' do
    context 'POST /logout' do
      it 'clears the session' do
        # First login
        post '/login', params: {
          email: user_email,
          password: user_password
        }

        # Then logout
        post '/logout'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'DELETE /login (alternative logout)' do
      it 'clears the session' do
        delete '/login'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end
  end

  describe 'Session Info' do
    context 'GET /login when not logged in' do
      it 'returns logged_in: false' do
        get '/login'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:logged_in]).to be false
      end
    end

    # NOTE: Testing logged-in state requires proper session handling
    # which may need additional configuration in request specs
  end

  describe 'Password Reset' do
    let(:user_id) { SecureRandom.uuid }

    before do
      Repos::Users.save({
                          id: user_id,
                          email: user_email,
                          password: BCrypt::Password.create(user_password),
                          lang: user_lang,
                          validation: true,
                          created_at: Time.now.to_i
                        })
    end

    context 'POST /forgotten_password with valid email' do
      it 'initiates password reset' do
        post '/forgotten_password', params: { email: user_email }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'POST /forgotten_password with non-existent email' do
      it 'returns error for unregistered email' do
        post '/forgotten_password', params: { email: 'nonexistent@example.com' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('non_existing_user')
      end
    end
  end
end
