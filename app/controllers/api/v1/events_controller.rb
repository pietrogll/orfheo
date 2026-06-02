# frozen_string_literal: true

module Api
  module V1
    class EventsController < ApplicationController
      skip_before_action :verify_authenticity_token
      before_action :require_login!, except: %i[program]

      # GET /api/v1/events/:id/program
      def program
        event_id = params[:id]
        lang = params[:lang] || 'es'

        unless %w[en es ca].include?(lang)
          return render json: { status: 'fail', reason: 'invalid_language' }, status: :bad_request
        end

        timestamp = CachedEvent.program_timestamp(event_id)
        last_modified_time = Time.at(timestamp / 1000.0).utc

        # 1. Standard HTTP Cache validation using Last-Modified and If-Modified-Since headers
        # -> allow Cloudfare to return 304 if the program data hasn't changed sinec Last-Modified
        response.headers['Last-Modified'] = last_modified_time.httpdate
        response.headers['Cache-Control'] = 'public, max-age=31536000'

        if request.headers['If-Modified-Since'].present?
          begin
            if_modified_since = Time.httpdate(request.headers['If-Modified-Since'])
            return head :not_modified if last_modified_time.to_i <= if_modified_since.to_i
          rescue ArgumentError
            # Ignore malformed If-Modified-Since header
          end
        end

        # Retrieve program results and hosts (unfiltered)
        results = Services::Search.get_program_results(lang, event_id, [], {}, nil, nil)
        hosts = Services::Events.get_event_program_hosts(event_id)

        success(
          program: results,
          hosts: hosts,
          program_timestamp: timestamp
        )
      end
    end
  end
end
