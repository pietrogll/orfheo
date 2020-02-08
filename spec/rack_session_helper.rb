module Rack
  module Test
    class Session
      alias_method :old_env_for, :env_for
      def rack_session
        @rack_session ||= {}
      end
      def rack_session=(hash)
        @rack_session = hash
      end
      def env_for(path, env)
        old_env_for(path, env).merge({'rack.session' => rack_session})
      end
    end
  end
end
