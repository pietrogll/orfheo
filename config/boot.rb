# frozen_string_literal: true

# Bundler setup for Rails application
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup' # Set up gems listed in the Gemfile.
# Speed up boot time by caching expensive operations (optional)
begin
  require 'bootsnap/setup'
rescue LoadError
  # Bootsnap is optional
end
