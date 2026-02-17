# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'FreeBlocks API', type: :request do
  let(:user) { create_user }
  let(:profile) { create_profile(user_id: user[:id]) }
  let(:free_block) { create_free_block(profile_id: profile[:id], user_id: user[:id]) }

  describe 'POST /users/create_free_block' do
    before { login_as(user) }

    it 'creates a new free block' do
      params = {
        profile_id: profile[:id],
        name: 'Availability',
        description: 'Details'
      }

      post '/users/create_free_block', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:free_block)
    end

    it 'requires profile ownership' do
      other_user = create_user
      other_profile = create_profile(user_id: other_user[:id])

      post '/users/create_free_block', params: { profile_id: other_profile[:id], name: 'Availability' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  describe 'POST /users/modify_free_block' do
    before { login_as(user) }

    it 'updates a free block' do
      params = {
        id: free_block[:id],
        profile_id: profile[:id],
        name: 'Updated'
      }

      post '/users/modify_free_block', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:free_block)
    end

    it 'requires free block ownership' do
      other_user = create_user
      other_free_block = create_free_block(profile_id: create_profile(user_id: other_user[:id])[:id],
                                           user_id: other_user[:id])

      post '/users/modify_free_block',
           params: { id: other_free_block[:id], profile_id: other_free_block[:profile_id], name: 'Updated' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  describe 'POST /users/delete_free_block' do
    before { login_as(user) }

    it 'deletes a free block' do
      post '/users/delete_free_block', params: { id: free_block[:id] }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end

    it 'requires free block ownership' do
      other_user = create_user
      other_free_block = create_free_block(profile_id: create_profile(user_id: other_user[:id])[:id],
                                           user_id: other_user[:id])

      post '/users/delete_free_block', params: { id: other_free_block[:id] }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  private
end
