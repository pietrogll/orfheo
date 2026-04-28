# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Profile Management', type: :request, swagger_doc: 'openapi.yaml' do
  path '/profiles' do
    get 'List all profiles' do
      tags 'Profiles'
      produces 'application/json'

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/list_profiles_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        run_test!
      end
    end
  end

  path '/profile' do
    get 'Show profile by id' do
      tags 'Profiles'
      produces 'application/json'
      description 'Returns the public profile document for a profile UUID. The current JSON endpoint resolves profiles via the `id` query parameter.'
      parameter name: :id, in: :query, type: :string, required: true, description: 'Profile UUID'

      response '200', 'Profile found' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/profile_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:id) { profile[:id] }
        run_test!
      end

      response '200', 'Profile not found' do
        schema '$ref' => '#/components/schemas/fail_envelope'
        let(:id) { SecureRandom.uuid }
        run_test!
      end
    end
  end

  path '/users/create_profile' do
    post 'Create profile' do
      tags 'Profiles'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/profile_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/profile_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { name: 'My Artistic Profile' } }
        run_test!
      end
    end
  end

  path '/users/modify_profile' do
    post 'Modify profile' do
      tags 'Profiles'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/profile_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/profile_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { id: SecureRandom.uuid, name: 'Updated Profile' } }
        run_test!
      end
    end
  end

  path '/users/delete_profile' do
    post 'Delete profile' do
      tags 'Profiles'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/id_only_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:id]) }
  let(:other_user) { create_test_user(email: 'other@example.com') }
  let(:other_profile) { create_test_profile(other_user[:id]) }

  describe 'GET /profile' do
    context 'when viewing own profile' do
      it 'shows profile with owner status' do
        login_as(user[:id])

        get '/profile', params: { id: profile[:id] }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:profile]).to be_present
        expect(json[:profile_status]).to eq('owner')
      end
    end

    context 'when viewing other profile' do
      it 'shows profile with visitor status' do
        login_as(user[:id])

        get '/profile', params: { id: other_profile[:id] }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:profile]).to be_present
        expect(json[:profile_status]).to eq('visitor')
      end
    end

    context 'when not logged in' do
      it 'shows profile as visitor' do
        get '/profile', params: { id: profile[:id] }, as: :json

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:profile]).to be_present
      end
    end
  end

  describe 'GET /profiles' do
    it 'lists all profiles' do
      profile # Create profile
      other_profile # Create another profile

      get '/profiles'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:profiles]).to be_an(Array)
    end
  end

  describe 'POST /users/create_profile' do
    context 'when logged in' do
      it 'creates a new profile' do
        login_as(user[:id])

        post '/users/create_profile', params: {
          name: 'New Artist Profile',
          short_description: 'A short description',
          description: 'A longer description',
          color: '#00FF00',
          facets: 'artist',
          email: { visible: 'false', value: 'artist@example.com' },
          address: { postal_code: '46020', locality: 'Valencia' },
          phone: { visible: 'false', value: '555-1234' },
          profile_picture: ['profile.jpg'],
          buttons: [{ text: 'Website', links: 'https://example.com' }],
          menu: %w[
            free_block
            upcoming
            space
            description
            portfolio
            history
          ]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:profile]).to be_present
        expect(json[:profile][:name]).to eq('New Artist Profile')
        expect(json[:profile][:user_id]).to eq(user[:id])
      end
    end

    context 'when not logged in' do
      it 'returns authentication error' do
        post '/users/create_profile', params: {
          name: 'New Profile'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('unauthorized')
      end
    end
  end

  describe 'POST /users/modify_profile' do
    context 'when logged in as owner' do
      it 'updates the profile' do
        login_as(user[:id])

        post '/users/modify_profile', params: {
          id: profile[:id],
          name: 'Updated Profile',
          short_description: 'Updated description',
          description: profile[:description],
          color: profile[:color],
          facets: profile[:facets],
          email: profile[:email],
          address: profile[:address],
          phone: profile[:phone],
          profile_picture: profile[:profile_picture],
          buttons: profile[:buttons],
          menu: profile[:menu]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:profile]).to be_present
        expect(json[:profile][:name]).to eq('Updated Profile')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns ownership error' do
        login_as(other_user[:id])

        post '/users/modify_profile', params: {
          id: profile[:id],
          name: 'Hacked Profile',
          short_description: profile[:short_description],
          description: profile[:description],
          color: profile[:color],
          facets: profile[:facets],
          email: profile[:email],
          address: profile[:address],
          phone: profile[:phone],
          profile_picture: profile[:profile_picture],
          buttons: profile[:buttons],
          menu: profile[:menu]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end
  end

  describe 'POST /users/delete_profile' do
    context 'when logged in as owner' do
      it 'deletes the profile' do
        login_as(user[:id])

        post '/users/delete_profile', params: {
          id: profile[:id]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns ownership error' do
        login_as(other_user[:id])

        post '/users/delete_profile', params: {
          id: profile[:id]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end
  end

  describe 'POST /users/list_profiles' do
    it 'lists user profiles' do
      login_as(user[:id])
      profile # Create profile

      post '/users/list_profiles'

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:profiles]).to be_an(Array)
      expect(json[:profiles].length).to be > 0
    end
  end

  # Helper methods
  def create_test_user(email: 'test@example.com')
    user_id = SecureRandom.uuid
    user_data = {
      id: user_id,
      email: email,
      password: BCrypt::Password.create('password123'),
      validation: true,
      created_at: Time.now
    }
    Repos::Users.save(user_data)
    user_data.merge(_id: user_id)
  end

  def create_test_profile(owner_id, name: 'Test Profile')
    profile_id = SecureRandom.uuid
    profile_data = {
      id: profile_id,
      user_id: owner_id,
      name: name,
      short_description: 'Short description',
      description: 'Test profile description',
      color: '#FF0000',
      facets: 'artist',
      email: { visible: 'false', value: 'test@example.com' },
      address: { postal_code: '46020', locality: 'Valencia' },
      phone: { visible: 'false', value: '555-0000' },
      profile_picture: ['test.jpg'],
      buttons: [{ text: 'Website', links: 'https://test.com' }],
      menu: %w[
        free_block
        upcoming
        space
        description
        portfolio
        history
      ],
      relations: [],
      created_at: Time.now
    }
    Repos::Profiles.save(profile_data)
    profile_data.merge(_id: profile_id)
  end

  def login_as(user_id)
    TestSessionMiddleware.session[:identity] = user_id
  end
end
