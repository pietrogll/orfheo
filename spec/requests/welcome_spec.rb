# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Welcome Page', type: :request do
  describe 'GET /' do
    it 'returns HTTP 200 success' do
      get '/'
      expect(response).to have_http_status(:success)
    end

    it 'renders the welcome page HTML' do
      get '/'
      expect(response.body).to include('orfheo')
      expect(response.content_type).to match(%r{text/html})
    end

    it 'includes the page title in meta tags' do
      get '/'
      expect(response.body).to include('orfheo | your cultural community')
    end

    it 'includes Pard.Welcome() JavaScript initialization' do
      get '/'
      expect(response.body).to include('Pard.Welcome()')
    end
  end

  describe 'GET /health' do
    it 'returns HTTP 200 for health check' do
      get '/health'
      expect(response).to have_http_status(:success)
      expect(response.body).to eq('OK')
    end
  end

  describe 'GET /up' do
    it 'returns HTTP 200 for Rails health check' do
      get '/up'
      expect(response).to have_http_status(:success)
    end
  end
end
