# frozen_string_literal: true

module Services
  class Cloudflare
    include HTTParty
    base_uri 'https://api.cloudflare.com/client/v4'

    class << self
      def purge_program_cache(event_id)
        zone_id = ENV.fetch('CLOUDFLARE_ZONE_ID', nil)
        api_token = ENV.fetch('CLOUDFLARE_API_TOKEN', nil)
        domain = ENV.fetch('DOMAIN_NAME', nil)

        return if zone_id.blank? || api_token.blank? || domain.blank?

        # Construct URLs for all supported languages
        urls = %w[es en ca].map do |lang|
          "https://#{domain}/api/v1/events/#{event_id}/program?lang=#{lang}"
        end
        # Add default URL in case lang parameter is omitted
        urls << "https://#{domain}/api/v1/events/#{event_id}/program"

        # Trigger Cloudflare API Purge using HTTParty
        headers = {
          'Authorization' => "Bearer #{api_token}",
          'Content-Type' => 'application/json'
        }
        body = { files: urls }.to_json

        post("/zones/#{zone_id}/purge_cache", headers: headers, body: body)
      rescue StandardError => e
        Rails.logger.error("Cloudflare Purge failed: #{e.message}")
      end
    end
  end
end
