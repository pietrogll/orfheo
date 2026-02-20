# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Galleries', type: :request do
  let(:user_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'admin@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:gallery_id) { SecureRandom.uuid }
  let(:user) { user_data }

  before do
    Repos::Users.save(user_data)
    MetaRepos::Admins.save({ id: user[:id], email: user[:email] })
    MetaRepos::Galleries.save({ _id: gallery_id, id: gallery_id, name: 'Test Gallery' })
  end

  after do
    Repos::Users.clear
    MetaRepos::Admins.clear
    MetaRepos::Galleries.clear
  end

  describe 'GET /admin/galleries' do
    it 'lists all galleries' do
      login_as(user[:id])
      get '/admin/galleries'

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:galleries]).to be_an(Array)
    end
  end

  describe 'POST /admin/galleries' do
    it 'creates a new gallery' do
      login_as(user[:id])
      post '/admin/galleries', params: { name: 'New Gallery' }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:gallery][:name]).to eq('New Gallery')
    end
  end

  describe 'PATCH /admin/galleries/:id' do
    it 'updates the gallery' do
      login_as(user[:id])
      patch "/admin/galleries/#{gallery_id}", params: { name: 'Updated Gallery' }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:gallery][:name]).to eq('Updated Gallery')
    end
  end

  describe 'DELETE /admin/galleries/:id' do
    it 'deletes the gallery' do
      login_as(user[:id])
      delete "/admin/galleries/#{gallery_id}"

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(MetaRepos::Galleries.exists?(gallery_id)).to be_falsey
    end
  end

  private

  def login_as(user_id)
    TestSessionMiddleware.session[:identity] = user_id
  end
end
