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

        urls = purge_urls(domain, event_id)

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

      private

      def purge_urls(domain, event_id)
        domains = domain_variants(domain)

        domains.flat_map do |host|
          language_urls(host, event_id) + [default_url(host, event_id)]
        end
      end

      def domain_variants(domain)
        normalized_domain = domain.sub(%r{\Ahttps?://}, '').delete_suffix('/')
        apex_domain = normalized_domain.sub(/\Awww\./, '')

        [normalized_domain, "www.#{apex_domain}"].uniq
      end

      def language_urls(domain, event_id)
        %w[es en ca].map do |lang|
          "#{default_url(domain, event_id)}?lang=#{lang}"
        end
      end

      def default_url(domain, event_id)
        "https://#{domain}/api/v1/events/#{event_id}/program"
      end
    end
  end
end
