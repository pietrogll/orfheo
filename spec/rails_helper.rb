# Rails-specific RSpec configuration
# This file is loaded by RSpec for Rails integration tests

require 'spec_helper'
ENV['RAILS_ENV'] ||= 'test'

# Load Rails environment
require_relative '../config/environment'

# Prevent database truncation if the environment is production
abort("The Rails environment is running in production mode!") if Rails.env.production?

require 'rspec/rails'

# Load support files
Dir[Rails.root.join('spec', 'support', '**', '*.rb')].sort.each { |f| require f }

# Configure DatabaseCleaner for MongoDB
require 'database_cleaner/mongo'

RSpec.configure do |config|
  # Use transactional fixtures - not applicable for MongoDB
  config.use_transactional_fixtures = false

  # Use standard Rails request spec integration
  config.include ActionDispatch::IntegrationTest::Behavior, type: :request

  # Configure DatabaseCleaner for MongoDB
  config.before(:suite) do
    # Get the MongoDB database connection
    require_relative '../config/initializers/mongodb'
    db = $db # Use the global $db set by mongodb initializer

    DatabaseCleaner[:mongo].db = db
    DatabaseCleaner[:mongo].strategy = :deletion
    DatabaseCleaner[:mongo].clean_with(:deletion)
  end

  config.before(:each) do
    DatabaseCleaner[:mongo].start
  end

  config.after(:each) do
    DatabaseCleaner[:mongo].clean
  end

  # Helper to parse JSON responses
  config.include Module.new {
    def parsed_response
      JSON.parse(response.body, symbolize_names: true)
    end

    def json_response
      JSON.parse(response.body)
    end
  }, type: :request

  # Reset session before each request spec
  config.before(:each, type: :request) do
    TestSessionMiddleware.reset_session!
  end

  # Rails-specific configurations
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
end
