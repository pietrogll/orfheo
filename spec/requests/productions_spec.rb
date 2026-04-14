# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Production Management', type: :request, swagger_doc: 'openapi.yaml' do
  path '/users/create_production' do
    post 'Create production' do
      tags 'Productions'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/create_production_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/production_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { profile_id: SecureRandom.uuid, title: 'New Play', category: 'theatre' } }
        run_test!
      end
    end
  end

  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:id]) }
  let(:production) { create_test_production(profile[:id], tags: nil) }
  let(:other_user) { create_test_user(email: 'other@example.com') }
  let(:other_profile) { create_test_profile(other_user[:id]) }

  describe 'POST /users/create_production' do
    context 'when logged in as profile owner' do
      it 'creates a new production' do
        login_as(user[:id])

        post '/users/create_production', params: {
          profile_id: profile[:id],
          title: 'New Production',
          short_description: 'A short description',
          description: 'A full description of the production',
          category: 'music',
          format: 'concert',
          duration: '120 min',
          photos: ['photo1.jpg', 'photo2.jpg']
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:production]).to be_present
        expect(json[:production][:title]).to eq('New Production')
        expect(json[:production][:profile_id]).to eq(profile[:id])
      end
    end

    context 'when logged in as non-owner' do
      it 'returns profile ownership error' do
        login_as(other_user[:id])

        post '/users/create_production', params: {
          profile_id: profile[:id],
          title: 'Unauthorized Production',
          short_description: 'Short',
          description: 'Full desc',
          category: 'arts',
          format: 'performance'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end

    context 'when not logged in' do
      it 'returns authentication error' do
        post '/users/create_production', params: {
          profile_id: profile[:id],
          title: 'Unauthorized Production'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('unauthorized')
      end
    end
  end

  describe 'POST /users/modify_production' do
    context 'when logged in as owner' do
      it 'updates the production' do
        login_as(user[:id])

        post '/users/modify_production', params: {
          id: production[:id],
          profile_id: production[:profile_id],
          title: 'Updated Production',
          short_description: production[:short_description],
          description: 'Updated description',
          category: production[:category],
          format: production[:format],
          duration: production[:duration],
          photos: production[:photos],
          main_picture: production[:main_picture]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "MODIFY PRODUCTION: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
        expect(json[:production]).to be_present
        expect(json[:production][:title]).to eq('Updated Production')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns production ownership error' do
        login_as(other_user[:id])

        post '/users/modify_production', params: {
          id: production[:id],
          name: 'Hacked Production'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end
  end

  describe 'POST /users/delete_production' do
    context 'when logged in as owner' do
      it 'deletes the production' do
        login_as(user[:id])

        post '/users/delete_production', params: {
          id: production[:id]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns production ownership error' do
        login_as(other_user[:id])

        post '/users/delete_production', params: {
          id: production[:id]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
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
      created_at: Time.now
    }
    Repos::Profiles.save(profile_data)
    profile_data.merge(_id: profile_id)
  end

  def create_test_production(profile_id, name: 'Test Production', tags: %w[tag1 tag2])
    production_id = SecureRandom.uuid
    production_data = {
      id: production_id,
      profile_id: profile_id,
      title: name,
      short_description: 'Short desc',
      description: 'Full description of production',
      category: 'arts',
      format: 'performance',
      duration: '90 min',
      main_picture: ['prod.jpg'],
      photos: ['prod.jpg', 'prod2.jpg'],
      tags: tags,
      created_at: Time.now
    }
    Repos::Productions.save(production_data)
    production_data.merge(_id: production_id)
  end

  def login_as(user_id)
    TestSessionMiddleware.session[:identity] = user_id
  end
end
