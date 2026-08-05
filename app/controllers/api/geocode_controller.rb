# frozen_string_literal: true

module Api
  class GeocodeController < ApplicationController
    include HTTParty
    skip_before_action :verify_authenticity_token
    before_action :require_login!

    # GET /api/geocode?address=...
    # Proxies the Google Geocoding API server-side so the API key stays secret
    def show
      address = params[:address]
      return head(:bad_request) if address.blank?

      response = self.class.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        query: { address: address, key: ENV.fetch('GOOGLE_GEOCODING_API_KEY') }
      )

      if response.success?
        render json: response.parsed_response
      else
        render json: { error: "Google Geocoding API returned status #{response.code}" },
               status: :bad_gateway
      end
    rescue StandardError => e
      render json: { error: e.message }, status: :bad_gateway
    end
  end
end
