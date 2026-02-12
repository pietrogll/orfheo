# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Proposals API', type: :request do
  let(:user) { create_user }
  let(:profile) { create_profile(owner_id: user[:id]) }
  let(:event) { create_event(owner_id: user[:id]) }
  let(:call) { create_call(profile_id: profile[:id], event_id: event[:id]) }

  describe 'Artist Proposals' do
    describe 'POST /users/send_artist_proposal' do
      before { login_as(user) }

      it 'creates an artist proposal' do
        params = {
          event_id: event[:id],
          profile_id: profile[:id],
          call_id: call[:id],
          own: 'false',
          title: 'Test Proposal'
        }

        post '/users/send_artist_proposal', params: params
        expect(response).to have_http_status(:success)
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
          own: 'false',
          title: 'Test Space Proposal',
          ambients: {}
        }

        post '/users/send_space_proposal', params: params
        expect(response).to have_http_status(:success)
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
