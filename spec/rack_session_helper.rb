# frozen_string_literal: true

module Rack
  module Test
    class Session
      alias old_env_for env_for
      def rack_session
        @rack_session ||= {}
      end

      attr_writer :rack_session

      def env_for(path, env)
        old_env_for(path, env).merge({ 'rack.session' => rack_session })
      end
    end
  end
end
