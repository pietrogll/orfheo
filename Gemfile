source 'https://rubygems.org'
ruby '3.4.4'
#ruby-gemset=orfheo

# Rails 8.1.2 Framework
gem 'rails', '~> 8.1.2'
gem 'puma', '~> 6.0'

gem 'rack-cors' # CORS middleware

# Database & Background Jobs (preserved from Sinatra)
gem 'mongo', '~> 2.8', '>= 2.8'
gem 'sidekiq'
gem 'sidekiq-status'
gem 'sucker_punch'
gem 'redis', '~> 5.0' # Required for Action Cable & Sidekiq

# Authentication & Security (preserved)
gem 'bcrypt'

# External Services (preserved)
gem 'cloudinary'
gem 'uuid'

# Utilities (preserved)
gem 'json'
gem 'dotenv'

# Sinatra dependencies (will be removed after migration)
gem 'sinatra', '~> 4.1', require: false
gem 'sinatra-contrib', '~> 4.1', '>= 4.1.1', require: false
gem 'sprockets-rails'
gem 'sprockets-helpers'
gem 'sprockets-es6'
gem 'sassc-rails'
gem 'uglifier'
# gem 'pony' - Migrated to ActionMailer (Rails 8)
gem 'faye-websocket' # Will migrate to Action Cable

gem 'sorted_set'

# gem 'newrelic_rpm' #Gem for monitoring memory leak


group :development, :test do
  gem 'rspec-rails', '~> 7.0' # Rails-specific RSpec support
  gem 'pry'
end

group :development do
	gem 'therubyracer'
	gem 'execjs'
	gem 'rerun'
end

group :test do
	gem 'rack-test'
  gem 'rspec'
  gem 'database_cleaner-mongo' # MongoDB test cleanup
	gem 'awesome_print'
	gem 'psych'
	gem 'rspec-eventmachine'
end
