# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Admin::Tags', type: :request do
  let(:user_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'admin@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:non_admin_data) { { _id: SecureRandom.uuid, id: SecureRandom.uuid, email: 'user@test.com', password_digest: BCrypt::Password.create('password'), lang: 'en' } }
  let(:tag_id) { SecureRandom.uuid }
  let(:user) { user_data }
  let(:non_admin) { non_admin_data }

  before do
    # Create users
    Repos::Users.save(user_data)
    Repos::Users.save(non_admin_data)

    # Create admin user
    MetaRepos::Admins.save({ _id: user[:_id], email: user[:email] })

    # Create test tag
    MetaRepos::Tags.save({ _id: tag_id, id: tag_id, name: 'Test Tag' })
  end

  after do
    Repos::Users.clear
    MetaRepos::Admins.clear
    MetaRepos::Tags.clear
  end

  describe 'GET /admin/tags' do
    context 'when logged in as admin' do
      it 'lists all tags' do
        login_as(user[:email])
        get '/admin/tags'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:tags]).to be_an(Array)
        expect(json[:data][:tags].size).to be >= 1
      end
    end

    context 'when logged in as non-admin' do
      it 'returns admin error' do
        login_as(non_admin[:email])
        get '/admin/tags'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('invalid_admin')
      end
    end

    context 'when not logged in' do
      it 'returns admin error' do
        get '/admin/tags'

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /admin/tags' do
    context 'when logged in as admin' do
      it 'creates a new tag' do
        login_as(user[:email])
        post '/admin/tags', params: { text: 'New Tag' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:tag][:text]).to eq('New Tag')
      end
    end

    context 'when logged in as non-admin' do
      it 'returns admin error' do
        login_as(non_admin[:email])
        post '/admin/tags', params: { name: 'New Tag' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'PATCH /admin/tags/:id' do
    context 'when logged in as admin' do
      it 'updates the tag' do
        login_as(user[:email])
        patch "/admin/tags/#{tag_id}", params: { text: 'Updated Tag' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:tag][:text]).to eq('Updated Tag')
      end
    end

    context 'when logged in as non-admin' do
      it 'returns admin error' do
        login_as(non_admin[:email])
        patch "/admin/tags/#{tag_id}", params: { name: 'Updated Tag' }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'DELETE /admin/tags/:id' do
    context 'when logged in as admin' do
      it 'deletes the tag' do
        login_as(user[:email])
        delete "/admin/tags/#{tag_id}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:data][:message]).to include('deleted')

        # Verify tag was deleted
        expect(MetaRepos::Tags.exists?(tag_id)).to be_falsey
      end
    end

    context 'when logged in as non-admin' do
      it 'returns admin error' do
        login_as(non_admin[:email])
        delete "/admin/tags/#{tag_id}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  private

  def login_as(user_email)
    TestSessionMiddleware.session[:identity] = user_email
  end
end
