# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Search', type: :request, swagger_doc: 'openapi.yaml' do
  path '/search/load_results' do
    post 'Load search results' do
      tags 'Search'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/search_load_results_request' }

      response '200', 'Success' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/search_profiles_response' },
          { '$ref' => '#/components/schemas/search_productions_response' },
          { '$ref' => '#/components/schemas/search_spaces_response' },
          { '$ref' => '#/components/schemas/search_events_response' }
        ]
        example 'application/json', :profiles_results, {
          status: 'success',
          profiles: [
            {
              id: 'profile-1',
              _id: 'profile-1',
              name: 'Atlas Collective',
              facets: ['artist'],
              profile_picture: ['atlas.jpg'],
              address: {
                locality: 'Valencia',
                postal_code: '46001',
                neighborhood: 'Ciutat Vella',
                location: { lat: '39.4699', lng: '-0.3763' }
              },
              color: '#FF6600',
              tags: %w[music performance]
            }
          ],
          pull_params: {
            starting_db_position: 0,
            db_position: 1,
            n_pulled: 1,
            n_total: 1,
            first_half_results: 'true',
            n_results: 1
          },
          data: {
            profiles: [
              {
                id: 'profile-1',
                _id: 'profile-1',
                name: 'Atlas Collective',
                facets: ['artist'],
                profile_picture: ['atlas.jpg'],
                address: {
                  locality: 'Valencia',
                  postal_code: '46001',
                  neighborhood: 'Ciutat Vella',
                  location: { lat: '39.4699', lng: '-0.3763' }
                },
                color: '#FF6600',
                tags: %w[music performance]
              }
            ],
            pull_params: {
              starting_db_position: 0,
              db_position: 1,
              n_pulled: 1,
              n_total: 1,
              first_half_results: 'true',
              n_results: 1
            }
          }
        }, 'Profiles search response'
        example 'application/json', :productions_results, {
          status: 'success',
          productions: [
            {
              id: 'production-1',
              profile_id: 'profile-1',
              main_picture: ['production.jpg'],
              format: 'show',
              category: 'music',
              title: 'Midnight Set',
              duration: '60',
              children: 'false',
              cache: {
                value: 'yes',
                visible: 'true',
                comment: 'Premiere'
              },
              profile_color: '#224488',
              profile_name: 'Atlas Collective',
              tags: ['live']
            }
          ],
          pull_params: {
            starting_db_position: 0,
            db_position: 1,
            n_pulled: 1,
            n_total: 1,
            first_half_results: 'true',
            n_results: 1
          },
          data: {
            productions: [
              {
                id: 'production-1',
                profile_id: 'profile-1',
                main_picture: ['production.jpg'],
                format: 'show',
                category: 'music',
                title: 'Midnight Set',
                duration: '60',
                children: 'false',
                cache: {
                  value: 'yes',
                  visible: 'true',
                  comment: 'Premiere'
                },
                profile_color: '#224488',
                profile_name: 'Atlas Collective',
                tags: ['live']
              }
            ],
            pull_params: {
              starting_db_position: 0,
              db_position: 1,
              n_pulled: 1,
              n_total: 1,
              first_half_results: 'true',
              n_results: 1
            }
          }
        }, 'Productions search response'
        example 'application/json', :spaces_results, {
          status: 'success',
          spaces: [
            {
              id: 'space-1',
              profile_id: 'profile-1',
              name: 'Black Box Hall',
              type: 'venue',
              address: {
                route: 'Carrer de les Arts',
                street_number: '10',
                door: 'A',
                locality: 'Valencia',
                country: 'ES',
                postal_code: '46002',
                location: { lat: '39.4702', lng: '-0.3705' }
              },
              description: 'Flexible indoor venue',
              size: '250',
              main_picture: ['space.jpg'],
              profile_color: '#118866',
              profile_name: 'Atlas Collective'
            }
          ],
          pull_params: {
            starting_db_position: 0,
            db_position: 1,
            n_pulled: 1,
            n_total: 1,
            first_half_results: 'true',
            n_results: 1
          },
          data: {
            spaces: [
              {
                id: 'space-1',
                profile_id: 'profile-1',
                name: 'Black Box Hall',
                type: 'venue',
                address: {
                  route: 'Carrer de les Arts',
                  street_number: '10',
                  door: 'A',
                  locality: 'Valencia',
                  country: 'ES',
                  postal_code: '46002',
                  location: { lat: '39.4702', lng: '-0.3705' }
                },
                description: 'Flexible indoor venue',
                size: '250',
                main_picture: ['space.jpg'],
                profile_color: '#118866',
                profile_name: 'Atlas Collective'
              }
            ],
            pull_params: {
              starting_db_position: 0,
              db_position: 1,
              n_pulled: 1,
              n_total: 1,
              first_half_results: 'true',
              n_results: 1
            }
          }
        }, 'Spaces search response'
        example 'application/json', :events_results, {
          status: 'success',
          events: [
            {
              id: 'event-1',
              name: 'Summer Signal',
              type: 'festival',
              img: ['event.jpg'],
              place: 'Valencia',
              address: {
                route: 'Avinguda del Port',
                street_number: '25',
                door: '1',
                locality: 'Valencia',
                country: 'ES',
                postal_code: '46021',
                location: { lat: '39.4619', lng: '-0.3373' }
              },
              eventTime: [
                {
                  date: '2026-07-15',
                  time: ['18:00', '22:30']
                }
              ],
              categories: {
                participants: ['music'],
                hosts: ['festival']
              },
              professional: true,
              call_id: nil,
              past_event: false,
              color: '#AA3355'
            }
          ],
          pull_params: {
            starting_db_position: 0,
            db_position: 1,
            n_pulled: 1,
            n_total: 1,
            first_half_results: 'true',
            n_results: 1
          },
          data: {
            events: [
              {
                id: 'event-1',
                name: 'Summer Signal',
                type: 'festival',
                img: ['event.jpg'],
                place: 'Valencia',
                address: {
                  route: 'Avinguda del Port',
                  street_number: '25',
                  door: '1',
                  locality: 'Valencia',
                  country: 'ES',
                  postal_code: '46021',
                  location: { lat: '39.4619', lng: '-0.3373' }
                },
                eventTime: [
                  {
                    date: '2026-07-15',
                    time: ['18:00', '22:30']
                  }
                ],
                categories: {
                  participants: ['music'],
                  hosts: ['festival']
                },
                professional: true,
                call_id: nil,
                past_event: false,
                color: '#AA3355'
              }
            ],
            pull_params: {
              starting_db_position: 0,
              db_position: 1,
              n_pulled: 1,
              n_total: 1,
              first_half_results: 'true',
              n_results: 1
            }
          }
        }, 'Events search response'

        context 'when loading profiles' do
          let(:body) { { db_key: 'profiles', pull_params: { first_half_results: 'true' } } }
          run_test!
        end

        context 'when loading productions' do
          let(:body) { { db_key: 'productions', pull_params: { first_half_results: 'true' } } }
          run_test!
        end

        context 'when loading spaces' do
          let(:body) { { db_key: 'spaces', pull_params: { first_half_results: 'true' } } }
          run_test!
        end

        context 'when loading events' do
          let(:body) { { db_key: 'events', pull_params: { first_half_results: 'true' } } }
          run_test!
        end
      end

    end
  end

  path '/search/suggest' do
    post 'Get suggestions' do
      tags 'Suggest'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/suggest_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/meta_list_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { query: ['mus'], event_id: SecureRandom.uuid, lang: 'en' } }
        run_test!
      end
    end
  end

  path '/search/results' do
    post 'Get suggestion results' do
      tags 'Suggest'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/results_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/meta_list_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { query: ['music'], shown: [], event_id: SecureRandom.uuid, lang: 'en' } }
        run_test!
      end
    end
  end

  let(:user) { create_user }
  let(:event) { create_event(user_id: user[:id]) }

  describe 'GET /search/proposals' do
    it 'renders the search proposals page' do
      get '/search/proposals'
      expect(response).to have_http_status(:success)
      expect(response.body).to include('orfheo')
    end
  end

  describe 'GET /search/spaces' do
    it 'renders the search spaces page' do
      get '/search/spaces'
      expect(response).to have_http_status(:success)
      expect(response.body).to include('orfheo')
    end
  end

  describe 'GET /search/profiles' do
    it 'renders the search profiles page' do
      get '/search/profiles'
      expect(response).to have_http_status(:success)
      expect(response.body).to include('orfheo')
    end
  end

  describe 'GET /search/events' do
    it 'renders the search events page' do
      get '/search/events'
      expect(response).to have_http_status(:success)
      expect(response.body).to include('orfheo')
    end
  end

  describe 'POST /search/load_results' do
    it 'loads search results' do
      params = {
        pull_params: { page: 0, limit: 20 },
        db_key: 'profiles',
        query: { name: '' }
      }

      post '/search/load_results', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:pull_params]).to be_present
    end
  end

  describe 'GET /search/public_info' do
    let(:event) { create_event(user_id: user[:id]) }

    it 'returns public info for a database element' do
      get '/search/public_info', params: { id: event[:id], db_key: 'events' }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:db_element]).to be_present
    end
  end

  describe 'POST /search/suggest' do
    before { login_as(user) }

    it 'provides search suggestions' do
      params = {
        query: ['test'],
        event_id: event[:id],
        lang: 'en'
      }

      post '/search/suggest', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:items)
    end
  end

  describe 'POST /search/results' do
    before { login_as(user) }

    it 'returns search results' do
      params = {
        query: ['test'],
        shown: [],
        event_id: event[:id],
        lang: 'en'
      }

      post '/search/results', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:profiles)
    end
  end

  describe 'POST /search/suggest_program' do
    before { login_as(user) }

    it 'provides program search suggestions' do
      params = {
        query: ['test'],
        event_id: event[:id],
        filters: { participants: ['music'], hosts: ['festival'], other: ['other'] },
        lang: 'en'
      }

      post '/search/suggest_program', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:items)
    end
  end

  describe 'POST /search/results_program' do
    before { login_as(user) }

    it 'returns program search results' do
      params = {
        query: [],
        event_id: event[:id],
        filters: { participants: ['music'], hosts: ['festival'], other: ['other'] },
        date: nil,
        time: nil,
        lang: 'en'
      }

      post '/search/results_program', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:program)
    end
  end

  describe 'POST /search/suggest_tags' do
    before { login_as(user) }

    it 'suggests tags' do
      params = {
        query: ['test'],
        source: 'profiles'
      }

      post '/search/suggest_tags', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      puts "SUGGEST TAGS RESPONSE: #{json.inspect}" if json[:status] != 'success'
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:items)
    end
  end

  describe 'POST /search/suggest_event_names' do
    before { login_as(user) }

    it 'suggests event names' do
      post '/search/suggest_event_names', params: { query: ['test'] }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      puts "SUGGEST EVENT NAMES RESPONSE: #{json.inspect}" if json[:status] != 'success'
      expect(json[:status]).to eq('success')
      expect(json).to have_key(:items)
    end
  end
end
