# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Program Management', type: :request, swagger_doc: 'openapi.yaml' do
  path '/program' do
    get 'Show program' do
      tags 'Programs'
      produces 'application/json'
      parameter name: :id, in: :query, type: :string, description: 'Program ID'
      parameter name: :event_id, in: :query, type: :string, description: 'Event ID'

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/program_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:id) { program[:_id] }
        let(:event_id) { nil }

        before do
          login_as(user[:_id])
        end

        run_test!
      end
    end
  end

  path '/users/create_program' do
    post 'Create a new program' do
      tags 'Programs'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/program_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/program_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { event_id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  path '/users/modify_program' do
    post 'Modify an existing program' do
      tags 'Programs'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/program_upsert' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/program_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { id: SecureRandom.uuid, event_id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  path '/users/delete_program' do
    post 'Delete a program' do
      tags 'Programs'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/id_only_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  path '/users/space_order' do
    post 'Order spaces in program' do
      tags 'Programs'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { type: :object, properties: { event_id: { type: :string }, order: { type: :array, items: { type: :string } } } }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { event_id: SecureRandom.uuid, order: [SecureRandom.uuid] } }
        run_test!
      end
    end
  end

  path '/users/publish' do
    post 'Publish program' do
      tags 'Programs'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { type: :object, properties: { event_id: { type: :string } } }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/success_envelope' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { event_id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

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
      it 'returns ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        get "/program?id=#{program[:_id]}"

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/create_program' do
    context 'when logged in as event owner' do
      it 'creates a new program' do
        login_as(user[:_id])

        post '/users/create_program', params: {
          event_id: event[:_id],
          subcategories: { en: [] },
          texts: { en: { title: 'Main Stage' } },
          display_program: true
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "CREATE PROGRAM RESPONSE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
        expect(json[:program]).to be_present
        expect(json[:program][:texts]).to be_present
      end
    end

    context 'when logged in as non-owner' do
      it 'returns event ownership error' do
        other_user = create_test_user(email: 'other@example.com')
        login_as(other_user[:_id])

        post '/users/create_program', params: {
          event_id: event[:_id],
          subcategories: { en: [] },
          texts: { en: { title: 'Main Stage' } }
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/modify_program' do
    context 'when logged in as owner' do
      it 'updates the program' do
        login_as(user[:_id])

        post '/users/modify_program', params: {
          id: program[:_id],
          event_id: event[:_id],
          subcategories: { en: [] },
          texts: { en: { title: 'Updated Stage Name' } }
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        puts "MODIFY PROGRAM RESPONSE: #{json.inspect}" if json[:status] != 'success'
        expect(json[:status]).to eq('success')
        expect(json[:program][:texts]).to be_present
      end

      context 'with permanent activities' do
        it 'validates permanent activities exist' do
          activity = create_test_activity(program[:_id], event[:_id])
          login_as(user[:_id])

          post '/users/modify_program', params: {
            id: program[:_id],
            event_id: event[:_id],
            subcategories: { en: [] },
            texts: { en: { title: 'Updated Stage' } },
            permanents: [activity[:_id]]
          }

          expect(response).to have_http_status(:ok)
        end

        it 'raises error for non-existent permanent activities' do
          login_as(user[:_id])

          post '/users/modify_program', params: {
            id: program[:_id],
            event_id: event[:_id],
            subcategories: { en: [] },
            texts: { en: { title: 'Updated Stage' } },
            permanents: ['non-existent-activity-id']
          }

          expect(response).to have_http_status(:ok)
          json = JSON.parse(response.body, symbolize_names: true)
          expect(json[:status]).to eq('fail')
        end
      end
    end

    context 'when event is in the past' do
      it 'raises past event error' do
        past_event = create_test_event(user[:_id], profile[:_id], date_from: '2020-01-01', date_to: '2020-01-31')
        past_program = create_test_program(past_event[:_id], user[:_id])
        login_as(user[:_id])

        post '/users/modify_program', params: {
          id: past_program[:_id],
          event_id: past_event[:_id],
          subcategories: { en: [] },
          texts: { en: { title: 'Updated' } }
        }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
      end
    end
  end

  describe 'POST /users/delete_program' do
    context 'when logged in as admin' do
      it 'deletes the program' do
        admin_user = create_test_user(email: 'admin@example.com')
        MetaRepos::Admins.save({ id: admin_user[:_id], email: admin_user[:email] })
        login_as(admin_user[:_id])

        post '/users/delete_program', params: { id: program[:_id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('success')
      end
    end

    context 'when logged in as regular user' do
      it 'returns admin error' do
        login_as(user[:_id])

        post '/users/delete_program', params: { id: program[:_id] }

        expect(response).to have_http_status(:ok)
        json = JSON.parse(response.body, symbolize_names: true)
        expect(json[:status]).to eq('fail')
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

      post '/users/set_permanents', params: {
        event_id: event[:_id],
        program_id: program[:_id],
        permanents: ['non-existent-id'],
        signature: 'test-sig'
      }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
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

  def create_test_event(owner_id, profile_id, date_from: (Time.now + 30.days).strftime('%Y-%m-%d'),
                        date_to: (Time.now + 40.days).strftime('%Y-%m-%d'))
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
      subcategories: { en: [] },
      texts: { en: { title: 'Test Program' } },
      display_program: true,
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
