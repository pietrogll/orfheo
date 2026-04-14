# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Space Management', type: :request, swagger_doc: 'openapi.yaml' do
  path '/users/create_space' do
    post 'Create space' do
      tags 'Spaces'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/create_space_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/space_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { profile_id: SecureRandom.uuid, name: 'Main Venue', type: 'concert_hall' } }
        run_test!
      end
    end
  end

  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:id]) }
  let(:space) { create_test_space(profile[:id]) }
  let(:other_user) { create_test_user(email: 'other@example.com') }
  let(:other_profile) { create_test_profile(other_user[:id]) }

  describe 'POST /users/create_space' do
    context 'when logged in as profile owner' do
      it 'creates a new space' do
        login_as(user[:id])

        post '/users/create_space', params: {
          profile_id: profile[:id],
          name: 'New Space',
          description: 'A test space for performances',
          address: { postal_code: '28001', locality: 'Madrid' },
          type: 'gallery',
          size: '150 sqm',
          ambients: [
            {
              name: 'Exhibition Hall',
              description: 'Main exhibition space',
              allowed_formats: %w[exhibition performance],
              allowed_categories: %w[visual arts]
            }
          ]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:space]).to be_present
        expect(json[:space][:name]).to eq('New Space')
        expect(json[:space][:profile_id]).to eq(profile[:id])
      end
    end

    context 'when logged in as non-owner' do
      it 'returns profile ownership error' do
        login_as(other_user[:id])

        post '/users/create_space', params: {
          profile_id: profile[:id],
          name: 'Unauthorized Space',
          description: 'Desc',
          address: { postal_code: '28001', locality: 'Madrid' },
          type: 'theater',
          ambients: [
            {
              name: 'Hall',
              description: 'Desc',
              allowed_formats: ['concert'],
              allowed_categories: ['music']
            }
          ]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end

    context 'when not logged in' do
      it 'returns authentication error' do
        post '/users/create_space', params: {
          profile_id: profile[:id],
          name: 'Unauthorized Space'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('unauthorized')
      end
    end
  end

  describe 'POST /users/modify_space' do
    context 'when logged in as owner' do
      it 'updates the space' do
        login_as(user[:id])

        post '/users/modify_space', params: {
          id: space[:id],
          profile_id: space[:profile_id],
          name: 'Updated Space',
          description: 'Updated description',
          address: space[:address],
          type: space[:type],
          ambients: space[:ambients]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "MODIFY SPACE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
        expect(json[:space]).to be_present
        expect(json[:space][:name]).to eq('Updated Space')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns space ownership error' do
        login_as(other_user[:id])

        post '/users/modify_space', params: {
          id: space[:id],
          name: 'Hacked Space'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('ownership')
      end
    end
  end

  describe 'POST /users/delete_space' do
    context 'when logged in as owner' do
      it 'deletes the space' do
        login_as(user[:id])

        post '/users/delete_space', params: {
          id: space[:id]
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns space ownership error' do
        login_as(other_user[:id])

        post '/users/delete_space', params: {
          id: space[:id]
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

  def create_test_space(profile_id, name: 'Test Space')
    space_id = SecureRandom.uuid
    space_data = {
      id: space_id,
      profile_id: profile_id,
      name: name,
      description: 'Test space description',
      address: { postal_code: '46020', locality: 'Valencia' },
      type: 'theater',
      size: '200 sqm',
      ambients: [
        {
          id: SecureRandom.uuid,
          name: 'Main Hall',
          description: 'The main performance space',
          allowed_formats: %w[concert performance],
          allowed_categories: %w[music arts]
        }
      ],
      created_at: Time.now
    }
    Repos::Spaces.save(space_data)
    space_data.merge(_id: space_id)
  end

  def login_as(user_id)
    TestSessionMiddleware.session[:identity] = user_id
  end
end
