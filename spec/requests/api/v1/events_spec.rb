# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'API V1 Events Program', type: :request, swagger_doc: 'openapi.yaml' do
  path '/api/v1/events/{id}/program' do
    get 'Get event program' do
      tags 'Events'
      produces 'application/json'
      parameter name: :id, in: :path, type: :string, required: true, description: 'Event ID'
      parameter name: :lang, in: :query, type: :string, required: false, description: 'Language'
      parameter name: :program_timestamp, in: :query, type: :integer, required: false, description: 'Timestamp'
      parameter name: :'If-Modified-Since', in: :header, type: :string, required: false, description: 'HTTP Date header'

      let(:user) { create_test_user }
      let(:profile) { create_test_profile(user[:_id]) }
      let(:event) { create_test_event(user[:_id], profile[:_id]) }
      let(:id) { event[:_id] }
      let(:lang) { 'es' }
      let(:program_timestamp) { nil }
      let(:'If-Modified-Since') { nil }

      before do
        allow(Services::Search).to receive(:get_program_results).and_return([])
        allow(Services::Events).to receive(:get_event_program_hosts).and_return([])
        allow(CachedEvent).to receive(:program_timestamp).with(id).and_return(1_672_531_199_000)
      end

      response '200', 'success' do
        schema '$ref' => '#/components/schemas/event_program_response'

        run_test! do |response|
          expect(response.headers['Cache-Control']).to include('public')
          expect(response.headers['Cache-Control']).to include('max-age=31536000')
          expect(response.headers['Last-Modified']).to be_present
        end
      end

      response '304', 'not modified' do
        context 'when program timestamp matches' do
          let(:program_timestamp) { 1_672_531_199_000 }

          run_test!
        end

        context 'when If-Modified-Since matches last modified' do
          let(:'If-Modified-Since') { Time.at(1_672_531_199_000 / 1000.0).utc.httpdate }

          run_test!
        end
      end

      response '400', 'bad request' do
        schema '$ref' => '#/components/schemas/fail_envelope'

        context 'when invalid language is provided' do
          let(:lang) { 'fr' }

          run_test!
        end
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
      description: 'Test profile description',
      url: 'http://test.example.com',
      created_at: Time.now
    }
    Repos::Profiles.save(profile_data)
    profile_data.merge(_id: profile_id)
  end

  def create_test_event(owner_id, profile_id)
    event_id = SecureRandom.uuid
    event_data = {
      id: event_id,
      user_id: owner_id,
      profile_id: profile_id,
      name: 'Test Event',
      description: 'Test Description',
      date_from: '2025-12-01',
      date_to: '2025-12-31',
      professional: true,
      created_at: Time.now
    }
    Repos::Events.save(event_data)
    event_data.merge(_id: event_id)
  end
end
