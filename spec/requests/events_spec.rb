# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Event Management', type: :request do
  let(:user) { create_test_user }
  let(:profile) { create_test_profile(user[:_id]) }
  let(:event) { create_test_event(user[:_id], profile[:_id]) }

  describe 'GET /event/:slug' do
    it 'shows event by slug' do
      event_with_slug = create_test_event(user[:_id], profile[:_id], slug: 'test-event-2024')

      get "/event/#{event_with_slug[:slug]}"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Pard.Event')
    end

    it 'returns event data as JSON' do
      event_with_slug = create_test_event(user[:_id], profile[:_id], slug: 'test-event-json')

      get "/event/#{event_with_slug[:slug]}", headers: { 'Accept' => 'application/json' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:event]).to be_present
    end
  end

  describe 'GET /event' do
    it 'shows event by ID' do
      get "/event?id=#{event[:_id]}"

      expect(response).to have_http_status(:ok)
      expect(response.body).to include('Pard.Event')
    end

    it 'returns event data as JSON' do
      get "/event?id=#{event[:_id]}", headers: { 'Accept' => 'application/json' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:event]).to be_present
    end
  end

  describe 'GET /event_manager' do
    context 'when logged in as owner' do
      it 'shows event manager page' do
        login_as(user[:_id])

        get "/event_manager?id=#{event[:_id]}"

        expect(response).to have_http_status(:ok)
        expect(response.body).to include('Pard.EventManager')
      end
    end

    context 'when not logged in' do
      it 'returns unauthorized error' do
        get "/event_manager?id=#{event[:_id]}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns unexisting error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        get "/event_manager?id=#{event[:_id]}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end

    context 'when logged in as admin' do
      it 'shows event manager page' do
        admin_user = create_test_user(email: 'admin@example.com')
        MetaRepos::Admins.save({ id: admin_user[:id], email: admin_user[:email] })
        login_as(admin_user[:id])

        get "/event_manager?id=#{event[:_id]}"

        expect(response).to have_http_status(:ok)
      end
    end
  end

  describe 'GET /events' do
    it 'lists all events' do
      create_test_profile(user[:_id], name: 'Organizer')
      create_test_event(user[:_id], profile[:_id],
                        eventTime: [{ date: '2025-12-01', time: ['10:00'] }],
                        call_id: nil, program_id: nil)

      get '/events'

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST /users/create_event' do
    context 'when logged in' do
      it 'creates a new event' do
        login_as(user[:_id])

        post '/users/create_event', params: {
          profile_id: profile[:_id],
          name: 'New Event',
          description: 'Event description',
          date_from: '2024-12-01',
          date_to: '2024-12-31',
          texts: { en: 'Description' },
          eventTime: { type: 'exact', date: '2024-12-01' },
          categories: [],
          place: { city: 'Test City' },
          type: 'festival'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "CREATE EVENT RESPONSE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
        expect(json[:event]).to be_present
        expect(json[:event][:name]).to eq('New Event')
      end

      it 'returns profile ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        other_profile = create_test_profile(other_user[:_id])
        login_as(user[:_id])

        post '/users/create_event', params: {
          profile_id: other_profile[:_id],
          name: 'New Event'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end

    context 'when not logged in' do
      it 'returns unauthorized error' do
        post '/users/create_event', params: {
          profile_id: profile[:_id],
          name: 'New Event'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/modify_event' do
    context 'when logged in as owner' do
      it 'updates the event' do
        login_as(user[:_id])

        post '/users/modify_event', params: {
          id: event[:_id],
          name: 'Updated Event Name',
          texts: { en: 'Updated description' },
          eventTime: [{ date: '2025-12-01', time: ['10:00'] }],
          categories: [],
          place: { city: 'Test City' },
          type: 'festival'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
        expect(json[:event][:name]).to eq('Updated Event Name')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/modify_event', params: {
          id: event[:_id],
          name: 'Updated Event Name'
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/delete_event' do
    context 'when logged in as owner' do
      it 'deletes the event' do
        login_as(user[:_id])

        deletable_event = create_test_event(user[:_id], profile[:_id], professional: false)

        post '/users/delete_event', params: { id: deletable_event[:_id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as non-owner' do
      it 'returns ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/delete_event', params: { id: event[:_id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/check_slug' do
    it 'checks slug availability' do
      login_as(user[:_id])

      post '/users/check_slug', params: { slug: 'available-slug' }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:available]).to be_in([true, false])
    end
  end

  describe 'POST /users/create_slug' do
    it 'sets event slug' do
      login_as(user[:_id])

      post '/users/create_slug', params: {
        event_id: event[:_id],
        slug: 'my-event-slug'
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end
  end

  # Helper methods
  def create_test_user(email: 'test@example.com')
    user_id = SecureRandom.uuid
    user_data = {
      id: user_id,
      email: email,
      password: BCrypt::Password.create('password123'),
      validation: true, # Use 'validation' not 'validated'
      created_at: Time.now
    }
    Repos::Users.save(user_data)
    user_data.merge(_id: user_id) # Add _id for compatibility
  end

  def create_test_profile(owner_id, name: 'Test Profile')
    profile_id = SecureRandom.uuid
    profile_data = {
      id: profile_id,
      user_id: owner_id,
      name: name,
      description: 'Test profile description',
      url: 'http://test.example.com',
      created_at: Time.now
    }
    Repos::Profiles.save(profile_data)
    profile_data.merge(_id: profile_id) # Add _id for compatibility
  end

  def create_test_event(owner_id, profile_id, slug: nil, professional: true, eventTime: nil, call_id: nil,
                        program_id: nil)
    event_id = SecureRandom.uuid
    event_data = {
      id: event_id,
      user_id: owner_id,
      profile_id: profile_id,
      name: 'Test Event',
      description: 'Test Description',
      date_from: '2025-12-01',
      date_to: '2025-12-31',
      professional: professional, # Make professional by default for viewing
      created_at: Time.now,
      eventTime: eventTime,
      call_id: call_id,
      program_id: program_id
    }
    event_data[:slug] = slug if slug
    Repos::Events.save(event_data)

    # Create associated gallery
    MetaRepos::Galleries.save({
                                id: event_id,
                                photos: []
                              })

    event_data.merge(_id: event_id) # Add _id for compatibility
  end

  def login_as(user_id)
    # Set session directly via test middleware
    TestSessionMiddleware.session[:identity] = user_id
  end
end
