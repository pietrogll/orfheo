require 'rails_helper'

RSpec.describe 'Calls API', type: :request do
  let(:user) { create_user }
  let(:admin) { create_admin }
  let(:profile) { create_profile(owner_id: user[:id]) }
  let(:call) { create_call(profile_id: profile[:id]) }

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
        title: 'Test Call',
        description: 'Test Description'
      }

      post '/users/create_call', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:call][:title]).to eq('Test Call')
    end

    it 'requires profile ownership' do
      other_profile = create_profile(owner_id: create_user[:id])
      params = { profile_id: other_profile[:id], title: 'Test' }

      expect {
        post '/users/create_call', params: params
      }.to raise_error(Pard::Invalid)
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
      other_call = create_call(profile_id: create_profile(owner_id: create_user[:id])[:id])

      expect {
        post '/users/modify_call', params: { id: other_call[:id], title: 'Updated' }
      }.to raise_error(Pard::Invalid)
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
