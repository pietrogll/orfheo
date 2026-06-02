# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Activity Management', type: :request do
  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:_id]) }
  let(:event) { create_test_event(user[:_id], profile[:_id]) }
  let(:program) { create_test_program(event[:_id], user[:_id]) }

  describe 'POST /users/create_performances' do
    context 'when logged in as event owner' do
      it 'creates new performances/activities' do
        login_as(user[:_id])

        post '/users/create_performances', params: {
          event_id: event[:_id],
          program_id: program[:_id],
          performances: [
            { name: 'Performance 1', start_time: '18:00', duration: 60, phone: { value: '123' }, email: 'p1@ex.com' },
            { name: 'Performance 2', start_time: '20:00', duration: 90, phone: { value: '456' }, email: 'p2@ex.com' }
          ],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:event]).to eq('addPerformances')
        expect(json[:model]).to be_present
      end
    end

    context 'when logged in as non-owner' do
      it 'raises event ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/create_performances', params: {
          event_id: event[:_id],
          program_id: program[:_id],
          performances: [{ name: 'Performance 1' }],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('you_dont_have_permission')
      end
    end

    context 'when not logged in' do
      it 'raises unauthorized error' do
        post '/users/create_performances', params: {
          event_id: event[:_id],
          program_id: program[:_id],
          performances: [{ name: 'Performance 1' }],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('unauthorized')
      end
    end
  end

  describe 'POST /users/modify_performances' do
    let(:activity) { create_test_activity(program[:_id], event[:_id]) }

    context 'when logged in as event owner' do
      it 'updates performances/activities' do
        login_as(user[:_id])

        post '/users/modify_performances', params: {
          event_id: event[:_id],
          performances: [
            { id: activity[:_id], name: 'Updated Performance', start_time: '19:00', phone: { value: '123' }, email: 'p1@ex.com' }
          ],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:event]).to eq('modifyPerformances')
        expect(json[:model]).to be_present
      end

      it 'returns the updated performance time from the public program API' do
        login_as(user[:_id])
        updated_time = %w[1764615600000 1764619200000]

        post '/users/modify_performances', params: {
          event_id: event[:_id],
          performances: [
            {
              id: activity[:_id],
              dateTime: [{ date: '2025-12-01', time: updated_time }]
            }
          ],
          signature: 'test-sig'
        }
        get "/api/v1/events/#{event[:_id]}/program"

        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:program].find { |performance| performance[:id] == activity[:_id] }[:time]).to eq(updated_time)
      end
    end

    context 'when logged in as non-owner' do
      it 'raises event ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/modify_performances', params: {
          event_id: event[:_id],
          performances: [{ id: activity[:_id], name: 'Updated' }],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('you_dont_have_permission')
      end
    end
  end

  describe 'POST /users/delete_performances' do
    let(:activity) { create_test_activity(program[:_id], event[:_id]) }

    context 'when logged in as event owner' do
      it 'deletes performances/activities' do
        login_as(user[:_id])

        post '/users/delete_performances', params: {
          event_id: event[:_id],
          performance_ids: [activity[:_id]],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:event]).to eq('deletePerformances')
        expect(json[:model]).to be_present
      end
    end

    context 'when logged in as non-owner' do
      it 'raises event ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/delete_performances', params: {
          event_id: event[:_id],
          performance_ids: [activity[:_id]],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('you_dont_have_permission')
      end
    end

    context 'when not logged in' do
      it 'raises unauthorized error' do
        post '/users/delete_performances', params: {
          event_id: event[:_id],
          performance_ids: [activity[:_id]],
          signature: 'test-sig'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
        expect(json[:reason]).to eq('unauthorized')
      end
    end
  end

  # Helper methods
  def create_test_user(email: 'test@example.com')
    user_data = {
      id: SecureRandom.uuid,
      email: email,
      password: BCrypt::Password.create('password123'),
      validation: true,
      created_at: Time.now
    }
    Repos::Users.save(user_data)
    user_data.merge(_id: user_data[:id])
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

  def create_test_event(owner_id, profile_id)
    event_id = SecureRandom.uuid
    event_data = {
      id: event_id,
      user_id: owner_id,
      profile_id: profile_id,
      name: 'Test Event',
      date_from: '2025-12-01',
      date_to: '2025-12-31',
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
      order: [],
      created_at: Time.now
    }
    Repos::Programs.save(program_data)
    Repos::Events.modify({ id: event_id, program_id: program_id })
    program_data.merge(_id: program_id)
  end

  def create_test_activity(program_id, event_id)
    activity_id = SecureRandom.uuid
    participant = create_test_profile(user[:_id], name: 'Participant Profile')
    activity_data = {
      id: activity_id,
      program_id: program_id,
      event_id: event_id,
      participant_id: participant[:_id],
      host_id: profile[:_id],
      name: 'Test Activity',
      dateTime: [{ date: '2025-12-01', time: %w[1764612000000 1764615600000] }],
      permanent: false,
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
