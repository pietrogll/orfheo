# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Forms API', type: :request do
  let(:user) { create_user }
  let(:profile) { create_profile(owner_id: user[:id]) }
  let(:call) { create_call(profile_id: profile[:id]) }
  let(:form) { create_form(call_id: call[:id]) }

  describe 'POST /forms/' do
    before { login_as(user) }

    it 'lists forms for a call' do
      params = {
        call_id: call[:id],
        lang: 'en'
      }

      post '/forms/', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:forms)
    end
  end

  describe 'POST /forms/create' do
    before { login_as(user) }

    it 'creates a new form' do
      params = {
        call_id: call[:id],
        title: 'Application Form',
        fields: []
      }

      post '/forms/create', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:form][:title]).to eq('Application Form')
    end

    it 'requires call ownership' do
      other_call = create_call(profile_id: create_profile(owner_id: create_user[:id])[:id])

      expect do
        post '/forms/create', params: { call_id: other_call[:id], title: 'Form' }
      end.to raise_error(Pard::Invalid)
    end
  end

  describe 'POST /forms/modify' do
    before { login_as(user) }

    it 'updates a form' do
      params = {
        id: form[:id],
        title: 'Updated Form Title'
      }

      post '/forms/modify', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:form][:title]).to eq('Updated Form Title')
    end

    it 'requires form ownership' do
      other_form = create_form(call_id: create_call(profile_id: create_profile(owner_id: create_user[:id])[:id])[:id])

      expect do
        post '/forms/modify', params: { id: other_form[:id], title: 'Updated' }
      end.to raise_error(Pard::Invalid)
    end
  end

  describe 'POST /forms/delete' do
    before { login_as(user) }

    it 'deletes a form' do
      post '/forms/delete', params: { id: form[:id] }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end

    it 'requires form ownership' do
      other_form = create_form(call_id: create_call(profile_id: create_profile(owner_id: create_user[:id])[:id])[:id])

      expect do
        post '/forms/delete', params: { id: other_form[:id] }
      end.to raise_error(Pard::Invalid)
    end
  end

  describe 'POST /forms/get_call_forms' do
    before { login_as(user) }

    it 'gets all forms for a call' do
      post '/forms/get_call_forms', params: { call_id: call[:id] }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:forms)
    end
  end
end
