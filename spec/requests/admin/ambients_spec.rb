# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Ambients', type: :request do
  let(:user_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'admin@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:non_admin_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'user@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:ambient_id) { SecureRandom.uuid }
  let(:user) { user_data }
  let(:non_admin) { non_admin_data }

  before do
    Repos::Users.save(user_data)
    Repos::Users.save(non_admin_data)
    MetaRepos::Admins.save({ _id: user[:_id], email: user[:email] })
    MetaRepos::Ambients.save({ _id: ambient_id, id: ambient_id, name: 'Test Ambient' })
  end

  after do
    Repos::Users.clear
    MetaRepos::Admins.clear
    MetaRepos::Ambients.clear
  end

  describe 'GET /admin/ambients' do
    context 'when logged in as admin' do
      it 'lists all ambients' do
        login_as(user[:email])
        get '/admin/ambients'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:ambients]).to be_an(Array)
      end
    end

    context 'when not admin' do
      it 'returns admin error' do
        login_as(non_admin[:email])
        get '/admin/ambients'

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /admin/ambients' do
    context 'when logged in as admin' do
      it 'creates a new ambient' do
        login_as(user[:email])
        post '/admin/ambients', params: { name: 'New Ambient' }

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:ambient][:name]).to eq('New Ambient')
      end
    end
  end

  describe 'PATCH /admin/ambients/:id' do
    context 'when logged in as admin' do
      it 'updates the ambient' do
        login_as(user[:email])
        patch "/admin/ambients/#{ambient_id}", params: { name: 'Updated Ambient' }

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:ambient][:name]).to eq('Updated Ambient')
      end
    end
  end

  describe 'DELETE /admin/ambients/:id' do
    context 'when logged in as admin' do
      it 'deletes the ambient' do
        login_as(user[:email])
        delete "/admin/ambients/#{ambient_id}"

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(MetaRepos::Ambients.exists?(ambient_id)).to be_falsey
      end
    end
  end

  private

  def login_as(user_email)
    TestSessionMiddleware.session[:identity] = user_email
  end
end
