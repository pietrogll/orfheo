# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Security hardening', type: :request do
  describe 'CSRF protection' do
    around do |example|
      original = ActionController::Base.allow_forgery_protection
      ActionController::Base.allow_forgery_protection = true
      example.run
    ensure
      ActionController::Base.allow_forgery_protection = original
    end

    let(:user) { create_user(password: 'password123') }

    before do
      login_as(user)
    end

    it 'rejects authenticated writes without a CSRF token' do
      post '/users/modify_password', params: { password: 'newpassword123' }

      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'profiles index' do
    let!(:hidden_profile) do
      create_profile(
        email: { value: 'hidden@example.com', visible: 'false' },
        phone: { value: '555', visible: 'false' }
      )
    end

    it 'does not expose hidden contact fields' do
      get '/profiles'

      profile = parsed_response[:profiles].find { |entry| entry[:id] == hidden_profile[:id] }
      expect(profile).not_to have_key(:email)
    end
  end

  describe 'call forms exposure' do
    let(:owner) { create_user }
    let(:owner_profile) { create_profile(user_id: owner[:id]) }
    let(:call) { create_call(user_id: owner[:id], profile_id: owner_profile[:id]) }
    let!(:form) { create_form(call_id: call[:id], user_id: owner[:id]) }
    let(:other_user) { create_user }

    it 'requires call ownership to fetch raw call forms' do
      login_as(other_user)

      post '/forms/get_call_forms', params: { call_id: call[:id] }

      expect(parsed_response[:status]).to eq('fail')
    end

    it 'returns raw call forms to the call owner' do
      login_as(owner)

      post '/forms/get_call_forms', params: { call_id: call[:id] }

      expect(parsed_response[:status]).to eq('success')
    end
  end

  describe 'profile productions and spaces' do
    let(:owner) { create_user }
    let(:owner_profile) { create_profile(user_id: owner[:id]) }
    let(:other_user) { create_user }

    it 'requires profile ownership' do
      login_as(other_user)

      post '/users/profile_productions_spaces', params: { profile_id: owner_profile[:id] }

      expect(parsed_response[:status]).to eq('fail')
    end
  end

  describe 'password reset flow' do
    let(:password) { 'password123' }
    let(:user) { create_user(email: 'recover@example.com', password: password) }

    it 'issues a dedicated reset token instead of reusing validation flow' do
      post '/forgotten_password', params: { email: user[:email] }

      reset_user = Repos::Users.get_by_id(user[:id])
      expect(reset_user[:reset_password_token]).to be_present
    end

    it 'resets the password through the dedicated reset endpoint' do
      post '/forgotten_password', params: { email: user[:email] }
      reset_user = Repos::Users.get_by_id(user[:id])

      post '/login/reset_password',
           params: { token: reset_user[:reset_password_token], password: 'updatedpassword' }

      post '/login', params: { email: user[:email], password: 'updatedpassword' }

      expect(parsed_response[:status]).to eq('success')
    end
  end
end
