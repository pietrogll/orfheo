# frozen_string_literal: true

source 'https://rubygems.org'
ruby '3.4.4'
# ruby-gemset=orfheo

# Rails 8.1.2 Framework
gem 'puma', '~> 6.0'
gem 'rails', '~> 8.1.2'

gem 'rack-cors' # CORS middleware

# Database & Background Jobs (preserved from Sinatra)
gem 'mongo', '~> 2.8', '>= 2.8'
gem 'redis', '~> 5.0' # Required for Action Cable & Sidekiq
gem 'sidekiq'
gem 'sidekiq-status'
gem 'sucker_punch'

# Authentication & Security (preserved)
gem 'bcrypt'

# External Services (preserved)
gem 'cloudinary'
gem 'uuid'

# Utilities (preserved)
gem 'dotenv'
gem 'json'

# Sinatra dependencies removed

# Asset Pipeline (Sprockets)
gem 'sassc-rails'
gem 'sprockets-rails'
gem 'sprockets-es6'
gem 'uglifier'

group :development, :test do
  gem 'pry'
  gem 'rails_best_practices', require: false
  gem 'rspec-rails', '~> 7.0' # Rails-specific RSpec support
  gem 'rubocop-rails', require: false
end

group :development do
  gem 'execjs'
  gem 'rerun'
  gem 'therubyracer'
end

group :test do
  gem 'awesome_print'
  gem 'database_cleaner-mongo' # MongoDB test cleanup
  gem 'psych'
  gem 'rack-test'
  gem 'rspec'
  gem 'rspec-eventmachine'
  gem 'sorted_set'
end
