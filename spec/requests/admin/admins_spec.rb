# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Admins', type: :request do
  let(:user_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'admin@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:other_user_data) do
    { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'newadmin@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' }
  end
  let(:user) { user_data }
  let(:other_user) { other_user_data }

  before do
    Repos::Users.save(user_data)
    Repos::Users.save(other_user_data)
    MetaRepos::Admins.save({ id: user[:id], email: user[:email] })
  end

  after do
    Repos::Users.clear
    MetaRepos::Admins.clear
  end

  describe 'GET /admin/admins' do
    it 'lists all admins' do
      login_as(user[:id])
      get '/admin/admins'

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:admins]).to be_an(Array)
      expect(json[:data][:admins].size).to be >= 1
    end
  end

  describe 'POST /admin/admins' do
    it 'creates a new admin' do
      login_as(user[:id])
      post '/admin/admins', params: { email: other_user[:email] }

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:admin][:email]).to eq(other_user[:email])
      expect(json[:data][:admin][:id]).to be_present

      # Verify user is now admin by checking email
      admin = MetaRepos::Admins.get(email: other_user[:email]).first
      expect(admin).to be_present
      expect(admin[:email]).to eq(other_user[:email])
    end
  end

  describe 'DELETE /admin/admins/:id' do
    it 'removes admin privileges' do
      # First make other user an admin
      MetaRepos::Admins.save({ id: other_user[:id], email: other_user[:email] })

      login_as(user[:id])
      delete "/admin/admins/#{other_user[:id]}"

      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')

      # Verify admin privileges removed
      expect(MetaRepos::Admins.exists?(other_user[:id])).to be_falsey
    end
  end

  private

  def login_as(user_id)
    TestSessionMiddleware.session[:identity] = user_id
  end
end
