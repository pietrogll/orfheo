# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Forms', type: :request, swagger_doc: 'openapi.yaml' do
  path '/forms' do
    post 'List forms' do
      tags 'Forms'
      consumes 'application/json'
      produces 'application/json'
      parameter name: :body, in: :body, schema: { type: :object, properties: { call_id: { type: :string } } }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/get_forms_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { call_id: SecureRandom.uuid } }
        run_test!
      end
    end
  end

  path '/forms/create' do
    post 'Create form' do
      tags 'Forms'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/create_form_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/form_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { call_id: SecureRandom.uuid, type: 'artist', blocks: {}, texts: { en: { label: 'My Form' } } } }
        run_test!
      end
    end
  end

  path '/forms/modify' do
    post 'Modify form' do
      tags 'Forms'
      consumes 'application/json'
      produces 'application/json'
      security [cookieAuth: []]
      parameter name: :body, in: :body, schema: { '$ref' => '#/components/schemas/modify_form_request' }

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/form_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        let(:body) { { id: SecureRandom.uuid, call_id: SecureRandom.uuid, type: 'artist', blocks: {}, texts: { en: { label: 'Updated Form' } } } }
        run_test!
      end
    end
  end

  let(:user) { create_user }
  let(:profile) { create_profile(user_id: user[:id]) }
  let(:call) { create_call(profile_id: profile[:id], user_id: user[:id]) }
  let(:form) { create_form(call_id: call[:id]) }

  describe 'POST /forms/' do
    before { login_as(user) }

    it 'lists forms for a call' do
      create_form(call_id: call[:id])
      params = {
        call_id: call[:id],
        lang: 'en'
      }

      post '/forms/', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:forms)
    end
  end

  describe 'POST /forms/create' do
    before { login_as(user) }

    it 'creates a new form' do
      params = {
        call_id: call[:id],
        type: 'artist',
        title: 'Application Form',
        blocks: { en: { title: { label: 'Title' }, description: { label: 'Description' },
                        short_description: { label: 'Short' }, category: { label: 'Category' },
                        subcategory: { label: 'Subcategory' }, format: { label: 'Format' } } },
        texts: { en: { label: 'Form' } }
      }

      post '/forms/create', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:form][:texts]).to be_present
    end

    it 'requires call ownership' do
      other_user = create_user
      other_call = create_call(profile_id: create_profile(user_id: other_user[:id])[:id],
                               user_id: other_user[:id])

      post '/forms/create', params: { call_id: other_call[:id], type: 'artist',
                                      blocks: { en: { title: { label: 'Title' }, description: { label: 'Description' },
                                                      short_description: { label: 'Short' }, category: { label: 'Category' },
                                                      subcategory: { label: 'Subcategory' }, format: { label: 'Format' } } },
                                      texts: { en: { label: 'Form' } } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  describe 'POST /forms/modify' do
    before { login_as(user) }

    it 'updates a form' do
      owner_form = create_form(call_id: call[:id], user_id: user[:id])
      params = {
        id: owner_form[:id],
        call_id: owner_form[:call_id],
        type: 'artist',
        blocks: { en: { title: { label: 'Title' }, description: { label: 'Description' },
                        short_description: { label: 'Short' }, category: { label: 'Category' },
                        subcategory: { label: 'Subcategory' }, format: { label: 'Format' } } },
        texts: { en: { label: 'Updated' } }
      }

      post '/forms/modify', params: params
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data][:form][:texts]).to be_present
    end

    it 'requires form ownership' do
      other_user = create_user
      other_form = create_form(call_id: create_call(profile_id: create_profile(user_id: other_user[:id])[:id],
                                                    user_id: other_user[:id])[:id])

      post '/forms/modify', params: { id: other_form[:id], type: 'artist',
                                      blocks: { en: { title: { label: 'Title' }, description: { label: 'Description' },
                                                      short_description: { label: 'Short' }, category: { label: 'Category' },
                                                      subcategory: { label: 'Subcategory' }, format: { label: 'Format' } } },
                                      texts: { en: { label: 'Updated' } } }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  describe 'POST /forms/delete' do
    before { login_as(user) }

    it 'deletes a form' do
      owner_form = create_form(call_id: call[:id], user_id: user[:id])

      post '/forms/delete', params: { id: owner_form[:id] }
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
    end

    it 'requires form ownership' do
      other_user = create_user
      other_form = create_form(call_id: create_call(profile_id: create_profile(user_id: other_user[:id])[:id],
                                                    user_id: other_user[:id])[:id])

      post '/forms/delete', params: { id: other_form[:id] }

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('fail')
    end
  end

  describe 'POST /forms/get_call_forms' do
    before { login_as(user) }

    it 'gets all forms for a call' do
      post '/forms/get_call_forms', params: { call_id: call[:id] }
      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body, symbolize_names: true)
      expect(json[:status]).to eq('success')
      expect(json[:data]).to have_key(:forms)
    end
  end
end
