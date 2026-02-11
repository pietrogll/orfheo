require_relative 'boot'

require 'rails'
# Pick the frameworks you want:
require 'active_model/railtie'
require 'active_job/railtie'
# require 'active_record/railtie' # Skip ActiveRecord - using MongoDB
# require 'active_storage/engine' # Skip ActiveStorage
require 'action_controller/railtie'
require 'action_mailer/railtie'
# require 'action_mailbox/engine' # Skip ActionMailbox
# require 'action_text/engine' # Skip ActionText
require 'action_view/railtie'
require 'action_cable/engine'
require 'sprockets/railtie'
# require 'rails/test_unit/railtie' # Using RSpec instead

# Require the gems listed in Gemfile
Bundler.require(*Rails.groups)

module Orfheo
  class Application < Rails::Application
    # Initialize configuration defaults for Rails 8.1
    config.load_defaults 8.1

    # Use Propshaft for asset pipeline (Rails 8 default)
    # Assets in app/assets/ will be compiled

    # Add React webpack output to asset paths
    config.assets.paths << Rails.root.join('assets', 'reactjs', 'dist')

    # Autoload paths for existing architecture (preserved from Sinatra)
    # NOTE: Repos are loaded manually by ReposFactory, not by Zeitwerk
    # config.autoload_paths << Rails.root.join('repos') # REMOVED - causes Zeitwerk naming conflicts
    config.autoload_paths << Rails.root.join('infrastructure')
    config.autoload_paths << Rails.root.join('services')
    config.autoload_paths << Rails.root.join('lib')
    config.autoload_paths << Rails.root.join('workers')

    # Exclude legacy Sinatra controllers and repos from autoloading (manual loading in config.rb)
    Rails.autoloaders.main.ignore(Rails.root.join('controllers'))
    Rails.autoloaders.main.ignore(Rails.root.join('repos'))

    # Eager load paths for production
    # NOTE: Repos are loaded manually by ReposFactory, not by Zeitwerk
    # config.eager_load_paths << Rails.root.join('repos') # REMOVED - causes Zeitwerk naming conflicts
    config.eager_load_paths << Rails.root.join('infrastructure')
    config.eager_load_paths << Rails.root.join('services')
    config.eager_load_paths << Rails.root.join('lib')

    # Middleware stack configuration
    config.middleware.use Rack::Deflater # Compression

    # Load Pard exceptions before middleware
    require_relative '../exceptions'

    # Custom exception handling middleware (from handling.rb)
    require_relative '../handling'
    config.middleware.use MyExceptionHandling

    # CORS configuration (if needed for API access)
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins '*'
        resource '*',
          headers: :any,
          methods: [:get, :post, :put, :patch, :delete, :options, :head]
      end
    end

    # Session configuration
    config.session_store :cookie_store, key: '_orfheo_session'

    # Time zone and locale
    config.time_zone = 'UTC'
    config.i18n.default_locale = :en

    # ActionMailer configuration
    config.action_mailer.delivery_method = :smtp
    config.action_mailer.perform_deliveries = true
    config.action_mailer.raise_delivery_errors = false
    config.action_mailer.default_options = {
      charset: 'UTF-8'
    }

    # SMTP settings (from environment variables)
    config.action_mailer.smtp_settings = {
      address: ENV['MAIL_ADDRESS'],
      port: ENV['MAIL_PORT'],
      authentication: :plain,
      user_name: ENV['MAIL_USER_NAME'],
      password: ENV['MAIL_PASSWORD'],
      enable_starttls_auto: true
    }

    # Rails 8.1 defaults
    # Note: cache_format_version must be 7.0 or 7.1 in Rails 8.1.2
    config.active_support.cache_format_version = 7.1

    # Don't generate system test files
    config.generators.system_tests = nil
  end
end
