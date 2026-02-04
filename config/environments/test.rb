require 'active_support/core_ext/integer/time'

# Load custom test session middleware
require_relative '../../spec/support/test_session_middleware'

# The test environment is used exclusively to run your application's test suite.
Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # While tests run files are not watched, reloading is not necessary.
  config.enable_reloading = false

  # Eager loading loads your entire application. When running a single test locally,
  # this is usually not necessary, and can slow down your test suite.
  config.eager_load = false

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.headers = { 'Cache-Control' => 'public, max-age=3600' }

  # Show full error reports.
  config.consider_all_requests_local = true
  config.cache_store = :null_store

  # Render exception templates for rescuable exceptions and raise for other exceptions.
  config.action_dispatch.show_exceptions = :rescuable

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Use custom test session middleware to avoid rack-session-2.1.1 incompatibility
  # The standard cookie store triggers "undefined method 'id' for Hash" in tests
  config.middleware.delete ActionDispatch::Session::CookieStore
  config.middleware.delete Rack::Session::Abstract::Persisted

  # Add our custom test session middleware
  config.middleware.use TestSessionMiddleware

  # Store uploaded files on the local file system in a temporary directory.
  # config.active_storage.service = :test

  # Disable caching.
  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  config.action_mailer.delivery_method = :test
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  config.action_view.annotate_rendered_view_with_filenames = true

  # Raise error when a before_action's only/except options reference missing actions.
  config.action_controller.raise_on_missing_callback_actions = true
end
