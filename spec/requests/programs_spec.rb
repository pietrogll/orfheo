# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Program Management', type: :request do
  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:_id]) }
  let(:event) { create_test_event(user[:_id], profile[:_id]) }
  let(:program) { create_test_program(event[:_id], user[:_id]) }

  describe 'GET /program' do
    context 'when logged in as owner' do
      it 'shows program' do
        login_as(user[:_id])

        get "/program?id=#{program[:_id]}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:program]).to be_present
      end
    end

    context 'when logged in as non-owner' do
      it 'raises ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        expect do
          get "/program?id=#{program[:_id]}"
        end.to raise_error(Pard::Invalid)
      end
    end
  end

  describe 'POST /users/create_program' do
    context 'when logged in as event owner' do
      it 'creates a new program' do
        login_as(user[:_id])

        post '/users/create_program', params: {
          event_id: event[:_id],
          name: 'Main Stage',
          description: 'Primary venue'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:program]).to be_present
        expect(json[:program][:name]).to eq('Main Stage')
      end
    end

    context 'when logged in as non-owner' do
      it 'raises event ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        expect do
          post '/users/create_program', params: {
            event_id: event[:_id],
            name: 'Main Stage'
          }
        end.to raise_error(Pard::Invalid::EventOwnership)
      end
    end
  end

  describe 'POST /users/modify_program' do
    context 'when logged in as owner' do
      it 'updates the program' do
        login_as(user[:_id])

        post '/users/modify_program', params: {
          id: program[:_id],
          name: 'Updated Stage Name'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:program][:name]).to eq('Updated Stage Name')
      end

      context 'with permanent activities' do
        it 'validates permanent activities exist' do
          activity = create_test_activity(program[:_id], event[:_id])
          login_as(user[:_id])

          post '/users/modify_program', params: {
            id: program[:_id],
            name: 'Updated Stage',
            permanents: [activity[:_id]]
          }

          expect(response).to have_http_status(:ok)
        end

        it 'raises error for non-existent permanent activities' do
          login_as(user[:_id])

          expect do
            post '/users/modify_program', params: {
              id: program[:_id],
              permanents: ['non-existent-activity-id']
            }
          end.to raise_error(Pard::Invalid)
        end
      end
    end

    context 'when event is in the past' do
      it 'raises past event error' do
        past_event = create_test_event(user[:_id], profile[:_id], date_from: '2020-01-01', date_to: '2020-01-31')
        past_program = create_test_program(past_event[:_id], user[:_id])
        login_as(user[:_id])

        expect do
          post '/users/modify_program', params: {
            id: past_program[:_id],
            name: 'Updated'
          }
        end.to raise_error(Pard::Invalid)
      end
    end
  end

  describe 'POST /users/delete_program' do
    context 'when logged in as admin' do
      it 'deletes the program' do
        admin_user = create_test_user(email: 'admin@example.com')
        MetaRepos::Admins.create({ _id: admin_user[:_id], email: admin_user[:email] })
        login_as(admin_user[:_id])

        post '/users/delete_program', params: { id: program[:_id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as regular user' do
      it 'raises admin error' do
        login_as(user[:_id])

        expect do
          post '/users/delete_program', params: { id: program[:_id] }
        end.to raise_error(Pard::Invalid::Admin)
      end
    end
  end

  describe 'POST /users/space_order' do
    it 'reorders spaces in program' do
      login_as(user[:_id])

      post '/users/space_order', params: {
        event_id: event[:_id],
        program_id: program[:_id],
        space_order: [1, 2, 3],
        signature: 'test-sig'
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end
  end

  describe 'POST /users/publish' do
    it 'publishes program' do
      login_as(user[:_id])

      post '/users/publish', params: {
        event_id: event[:_id],
        program_id: program[:_id],
        signature: 'test-sig'
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end
  end

  describe 'POST /users/set_permanents' do
    it 'sets permanent activity times' do
      activity = create_test_activity(program[:_id], event[:_id])
      login_as(user[:_id])

      post '/users/set_permanents', params: {
        event_id: event[:_id],
        program_id: program[:_id],
        permanents: [activity[:_id]],
        signature: 'test-sig'
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end

    it 'validates permanent activities exist' do
      login_as(user[:_id])

      expect do
        post '/users/set_permanents', params: {
          event_id: event[:_id],
          program_id: program[:_id],
          permanents: ['non-existent-id'],
          signature: 'test-sig'
        }
      end.to raise_error(Pard::Invalid)
    end
  end

  # Helper methods
  def create_test_user(email: 'test@example.com')
    user_id = SecureRandom.uuid
    user_data = {
      id: user_id,
      email: email,
      password: BCrypt::Password.create('password123'),
      validation: true,
      created_at: Time.now
    }
    Repos::Users.save(user_data)
    user_data.merge(_id: user_id)
  end

  def create_test_profile(owner_id, name: 'Test Profile')
    profile_id = SecureRandom.uuid
    profile_data = {
      id: profile_id,
      user_id: owner_id,
      name: name,
      description: 'Test profile',
      created_at: Time.now
    }
    Repos::Profiles.save(profile_data)
    profile_data.merge(_id: profile_id)
  end

  def create_test_event(owner_id, profile_id, date_from: '2025-12-01', date_to: '2025-12-31')
    event_id = SecureRandom.uuid
    event_data = {
      id: event_id,
      user_id: owner_id,
      profile_id: profile_id,
      name: 'Test Event',
      date_from: date_from,
      date_to: date_to,
      professional: true,
      created_at: Time.now
    }
    Repos::Events.save(event_data)
    event_data.merge(_id: event_id)
  end

  def create_test_program(event_id, owner_id)
    program_id = SecureRandom.uuid
    program_data = {
      id: program_id,
      event_id: event_id,
      user_id: owner_id,
      name: 'Test Program',
      created_at: Time.now
    }
    Repos::Programs.save(program_data)
    program_data.merge(_id: program_id)
  end

  def create_test_activity(program_id, event_id)
    activity_id = SecureRandom.uuid
    activity_data = {
      id: activity_id,
      program_id: program_id,
      event_id: event_id,
      name: 'Test Activity',
      created_at: Time.now
    }
    Repos::Activities.save(activity_data)
    activity_data.merge(_id: activity_id)
  end

  def login_as(user_id)
    # Set session directly via test middleware
    TestSessionMiddleware.session[:identity] = user_id
  end
end
