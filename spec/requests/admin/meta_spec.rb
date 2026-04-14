# frozen_string_literal: true

require 'rails_helper'
require 'swagger_helper'

RSpec.describe 'Admin Meta API', type: :request, swagger_doc: 'openapi.yaml' do
  path '/admin/assets' do
    get 'List assets' do
      tags 'Meta'
      produces 'application/json'
      security [cookieAuth: []]

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/meta_list_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        run_test!
      end
    end
  end

  path '/admin/participants' do
    get 'List participants' do
      tags 'Meta'
      produces 'application/json'
      security [cookieAuth: []]

      response '200', 'Success or fail' do
        schema oneOf: [
          { '$ref' => '#/components/schemas/meta_list_response' },
          { '$ref' => '#/components/schemas/fail_envelope' }
        ]
        run_test!
      end
    end
  end
end
