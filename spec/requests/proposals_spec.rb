# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Proposals', type: :request, swagger_doc: 'openapi.yaml' do
  path '/users/get_call_proposals' do
    post 'Get proposals for a call' do
      tags 'Proposals'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/get_call_proposals_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/get_call_proposals_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { call_id: SecureRandom.uuid, type: 'artist' } }
        run_test!
      end
    end
  end

  path '/users/send_artist_proposal' do
    post 'Send artist proposal' do
      tags 'Proposals'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/artist_proposal_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { call_id: SecureRandom.uuid, event_id: SecureRandom.uuid, title: 'My Proposal', subcategory: 'music' } }
        run_test!
      end
    end
  end

  path '/users/send_space_proposal' do
    post 'Send space proposal' do
      tags 'Proposals'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/space_proposal_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { call_id: SecureRandom.uuid, event_id: SecureRandom.uuid, profile_id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  let(:user) { create_user }
  let(:profile) do
    create_profile(user_id: user[:id], email: { value: user[:email], visible: 'false' },
                   phone: { value: '123', visible: 'false' }, color: 'blue',
                   name: 'Test Profile', address: { locality: 'Test City' })
  end
  let(:event) do
    create_event(user_id: user[:id], date_start: (Time.now + 10.days).to_i * 1000,
                 date_end: (Time.now + 20.days).to_i * 1000)
  end
  let(:call) { create_call(profile_id: profile[:id], event_id: event[:id]) }
  let(:form) { create_form(call_id: call[:id]) }

  describe 'Artist Proposals' do
    describe 'POST /users/send_artist_proposal' do
      before { login_as(user) }

      it 'creates an artist proposal' do
        params = {
          event_id: event[:id],
          profile_id: profile[:id],
          call_id: call[:id],
          form_id: form[:id],
          own: 'false',
          title: 'Test Proposal',
          short_description: 'Short',
          description: 'Full description',
          category: 'arts',
          subcategory: 'subcategory',
          format: 'performance',
          phone: { value: '123', visible: 'false' }
        }

        post '/users/send_artist_proposal', params: params
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "CREATE ARTIST PROPOSAL RESPONSE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
      end
    end

    describe 'POST /users/send_artist_proposal with numeric custom fields' do
      let(:call_owner) { create_user }
      let(:call_profile) { create_profile(user_id: call_owner[:id]) }
      let(:call_event) do
        create_event(user_id: call_owner[:id], date_start: (Time.now + 10.days).to_i * 1000,
                     date_end: (Time.now + 20.days).to_i * 1000)
      end
      let(:call_record) { create_call(user_id: call_owner[:id], profile_id: call_profile[:id], event_id: call_event[:id]) }
      let(:call_form) { create_form(call_id: call_record[:id]) }
      let(:applicant) { create_user }
      let(:applicant_profile) do
        create_profile(user_id: applicant[:id], email: { value: applicant[:email], visible: 'false' },
                       phone: { value: '999', visible: 'false' }, name: 'Applicant Artist')
      end

      before { login_as(applicant) }

      it 'accepts numeric custom field keys for non-call owners' do
        params = {
          event_id: call_event[:id],
          profile_id: applicant_profile[:id],
          call_id: call_record[:id],
          form_id: call_form[:id],
          own: 'false',
          title: 'External Proposal',
          short_description: 'Short',
          description: 'Full description',
          category: 'arts',
          subcategory: 'subcategory',
          format: 'performance',
          phone: { value: '999', visible: 'false' },
          email: { value: applicant[:email], visible: 'false' },
          '8': 'custom-answer'
        }

        post '/users/send_artist_proposal', params: params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    describe 'POST /users/modify_artist_proposal' do
      let(:proposal) { create_artist_proposal(profile_id: profile[:id], call_id: call[:id]) }
      before { login_as(user) }

      it 'updates an artist proposal' do
        params = {
          id: proposal[:id],
          event_id: event[:id],
          call_id: call[:id],
          title: 'Updated Proposal'
        }

        post '/users/modify_artist_proposal', params: params
        expect(response).to have_http_status(:success)
      end
    end

    describe 'POST /users/delete_artist_proposal' do
      let(:proposal) { create_artist_proposal(profile_id: profile[:id], call_id: call[:id]) }
      before { login_as(user) }

      it 'deletes an artist proposal' do
        params = {
          id: proposal[:id],
          event_id: event[:id],
          call_id: call[:id]
        }

        post '/users/delete_artist_proposal', params: params
        expect(response).to have_http_status(:success)
      end
    end
  end

  describe 'Space Proposals' do
    describe 'POST /users/send_space_proposal' do
      before { login_as(user) }

      it 'creates a space proposal' do
        params = {
          event_id: event[:id],
          profile_id: profile[:id],
          call_id: call[:id],
          form_id: form[:id],
          own: 'false',
          space_name: 'Test Space Proposal',
          address: 'Test City',
          category: 'home',
          subcategory: 'home',
          phone: { value: '123', visible: 'false' },
          '2': 'mandatory',
          type: 'space_type',
          description: 'space_description',
          single_ambient: 'true',
          ambients: [{ name: 'Main', description: 'Ambient', allowed_categories: ['music'], allowed_formats: ['concert'],
                       capacity: '10', photos: ['ambient.jpg'] }]
        }

        post '/users/send_space_proposal', params: params
        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "CREATE SPACE PROPOSAL RESPONSE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
      end
    end

    describe 'POST /users/send_space_proposal with numeric custom fields' do
      let(:call_owner) { create_user }
      let(:call_profile) { create_profile(user_id: call_owner[:id], type: 'space') }
      let(:call_event) do
        create_event(user_id: call_owner[:id], date_start: (Time.now + 10.days).to_i * 1000,
                     date_end: (Time.now + 20.days).to_i * 1000)
      end
      let(:call_record) { create_call(user_id: call_owner[:id], profile_id: call_profile[:id], event_id: call_event[:id]) }
      let(:call_form) { create_form(call_id: call_record[:id]) }
      let(:applicant) { create_user }
      let(:applicant_profile) do
        create_profile(user_id: applicant[:id], type: 'space', email: { value: applicant[:email], visible: 'false' },
                       phone: { value: '999', visible: 'false' }, name: 'Applicant Space')
      end

      before { login_as(applicant) }

      it 'accepts numeric custom field keys for non-call owners' do
        params = {
          event_id: call_event[:id],
          profile_id: applicant_profile[:id],
          call_id: call_record[:id],
          form_id: call_form[:id],
          own: 'false',
          space_name: 'External Space Proposal',
          address: 'Test City',
          category: 'home',
          subcategory: 'home',
          type: 'space_type',
          phone: { value: '999', visible: 'false' },
          email: { value: applicant[:email], visible: 'false' },
          description: 'space_description',
          single_ambient: 'true',
          '8': 'custom-answer',
          ambients: [{ name: 'Main', description: 'Ambient', allowed_categories: ['music'], allowed_formats: ['concert'],
                       capacity: '10', photos: ['ambient.jpg'] }]
        }

        post '/users/send_space_proposal', params: params

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    describe 'POST /users/modify_space_proposal' do
      let(:proposal) { create_space_proposal(profile_id: profile[:id], call_id: call[:id]) }
      before { login_as(user) }

      it 'updates a space proposal' do
        params = {
          id: proposal[:id],
          event_id: event[:id],
          call_id: call[:id],
          title: 'Updated Space Proposal',
          ambients: {}
        }

        post '/users/modify_space_proposal', params: params
        expect(response).to have_http_status(:success)
      end
    end

    describe 'POST /users/delete_space_proposal' do
      let(:proposal) { create_space_proposal(profile_id: profile[:id], call_id: call[:id]) }
      before { login_as(user) }

      it 'deletes a space proposal' do
        params = {
          id: proposal[:id],
          event_id: event[:id],
          call_id: call[:id]
        }

        post '/users/delete_space_proposal', params: params
        expect(response).to have_http_status(:success)
      end
    end
  end
end
