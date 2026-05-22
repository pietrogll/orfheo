# frozen_string_literal: true

# Rails 8.1 compatibility - preload action_encoding_template method
# This must run BEFORE controllers are loaded

module ActionController
  class Base
    def self.action_encoding_template(_action_name)
      false
    end
  end
end
