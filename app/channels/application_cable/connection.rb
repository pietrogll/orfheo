# frozen_string_literal: true

module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user_id

    def connect
      self.current_user_id = find_verified_user
    end

    private

    def find_verified_user
      # Extract user ID from session/cookies
      # Rails Action Cable uses the same cookie store as the main app
      if (verified_user_id = request.session[:identity])
        verified_user_id
      else
        reject_unauthorized_connection
      end
    end
  end
end
