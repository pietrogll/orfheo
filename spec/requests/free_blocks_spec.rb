# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'FreeBlocks API', type: :request do
  let(:user) { create_user }
  let(:profile) { create_profile(owner_id: user[:id]) }
  let(:free_block) { create_free_block(profile_id: profile[:id]) }

  describe 'POST /users/create_free_block' do
    before { login_as(user) }

    it 'creates a new free block' do
      params = {
        profile_id: profile[:id],
        start_date: '2025-02-01',
        end_date: '2025-02-05'
      }

      post '/users/create_free_block', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:free_block)
    end

    it 'requires profile ownership' do
      other_profile = create_profile(owner_id: create_user[:id])

      expect do
        post '/users/create_free_block', params: { profile_id: other_profile[:id] }
      end.to raise_error(Pard::Invalid)
    end
  end

  describe 'POST /users/modify_free_block' do
    before { login_as(user) }

    it 'updates a free block' do
      params = {
        id: free_block[:id],
        start_date: '2025-03-01',
        end_date: '2025-03-05'
      }

      post '/users/modify_free_block', params: params
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:free_block)
    end

    it 'requires free block ownership' do
      other_free_block = create_free_block(profile_id: create_profile(owner_id: create_user[:id])[:id])

      expect do
        post '/users/modify_free_block', params: { id: other_free_block[:id] }
      end.to raise_error(Pard::Invalid)
    end
  end

  describe 'POST /users/delete_free_block' do
    before { login_as(user) }

    it 'deletes a free block' do
      post '/users/delete_free_block', params: { id: free_block[:id] }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end

    it 'requires free block ownership' do
      other_free_block = create_free_block(profile_id: create_profile(owner_id: create_user[:id])[:id])

      expect do
        post '/users/delete_free_block', params: { id: other_free_block[:id] }
      end.to raise_error(Pard::Invalid)
    end
  end

  private
end
