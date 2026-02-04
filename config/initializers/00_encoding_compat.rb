# Rails 8.1 compatibility - preload action_encoding_template method
# This must run BEFORE controllers are loaded

module ActionController
  class Base
    def self.action_encoding_template(action_name)
      'utf-8'  # Return encoding name as string, not Encoding object
    end
  end
end
