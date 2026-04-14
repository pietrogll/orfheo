# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Open Calls', type: :request, swagger_doc: 'openapi.yaml' do
  path '/call' do
    get 'Show call' do
      tags 'Calls'
      produces 'application/json'
      parameter name: :id, in: :query, type: :string, description: 'Call ID'

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/call_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:id) { SecureRandom.uuid }
        run_test!
      end
    end
  end

  path '/users/create_call' do
    post 'Create call' do
      tags 'Calls'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/call_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/call_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { event_id: SecureRandom.uuid, start: Time.now.to_i, deadline: (Time.now + 86400).to_i } }
        run_test!
      end
    end
  end

  let(:user) { create_user }
  let(:admin) { create_admin }
  let(:profile) { create_profile(user_id: user[:id]) }
  let(:call) { create_call(user_id: user[:id], profile_id: profile[:id]) }

  describe 'GET /users/call' do
    context 'when admin' do
      before { login_as(admin) }

      it 'returns the call' do
        get '/users/call', params: { id: call[:id] }
        expect(response).to have_http_status(:success)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:call][:id]).to eq(call[:id])
      end
    end

    context 'when not admin' do
      before { login_as(user) }

      it 'raises authorization error' do
        get '/users/call', params: { id: call[:id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to include('admin')
      end
    end
  end

  describe 'POST /users/create_call' do
    before { login_as(user) }

    it 'creates a new call' do
      params = {
        profile_id: profile[:id],
        event_id: create_event[:id],
        title: 'Test Call',
        description: 'Test Description',
        start: Time.now.to_i * 1000,
        deadline: (Time.now + 30.days).to_i * 1000
      }

      post '/users/create_call', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:call][:title]).to eq('Test Call')
    end

    it 'requires profile ownership' do
      other_profile = create_profile(user_id: create_user[:id])
      params = { profile_id: other_profile[:id], title: 'Test' }

      post '/users/create_call', params: params
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
      expect(json[:reason]).to eq('you_dont_have_permission')
    end
  end

  describe 'POST /users/modify_call' do
    before { login_as(user) }

    it 'updates the call' do
      params = {
        id: call[:id],
        title: 'Updated Title'
      }

      post '/users/modify_call', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:call][:title]).to eq('Updated Title')
    end

    it 'requires call ownership' do
      other_call = create_call(user_id: create_user[:id])

      post '/users/modify_call', params: { id: other_call[:id], title: 'Updated' }
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
      expect(json[:reason]).to eq('you_dont_have_permission')
    end
  end

  describe 'POST /users/delete_call' do
    before { login_as(admin) }

    it 'deletes the call' do
      post '/users/delete_call', params: { id: call[:id] }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end
  end

  describe 'POST /users/checks_participant_name' do
    before { login_as(user) }

    it 'checks participant name availability' do
      params = {
        name: 'Test Participant',
        call_id: call[:id],
        program_id: 'program_123',
        participant_id: nil
      }

      post '/users/checks_participant_name', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:available)
    end
  end
end
