# Quick Start: Rails Migration

**Purpose**: Step-by-step guide for setting up and running the Rails 8.1.2 migration  
**Audience**: Developers working on the Sinatra → Rails migration  
**Prerequisites**: Ruby 3.4.4, MongoDB running locally, Node.js for React builds

## Overview

This guide walks through setting up the Rails environment, running the development server, and validating the migration incrementally.

## Installation

### 1. Install Rails 8.1.2

```bash
# Verify Ruby version
ruby -v  # Should show 3.4.4

# Install Rails 8.1.2
gem install rails -v 8.1.2

# Verify installation
rails -v  # Should show Rails 8.1.2
```

### 2. Update Gemfile

Add Rails and related gems to existing Gemfile:

```ruby
# Add these gems
gem 'rails', '8.1.2'
gem 'puma', '~> 6.0'  # Already present, ensure version
gem 'propshaft'       # Asset pipeline (Rails 8 default)
gem 'actioncable'     # WebSocket support (included with Rails)

# Keep existing gems
gem 'mongo', '~> 2.8'
gem 'sidekiq'
gem 'bcrypt'
gem 'cloudinary'
# ... all other existing gems

# Add for Redis (Action Cable + Sidekiq)
gem 'redis', '~> 5.0'

# Testing
group :test do
  gem 'rspec-rails'
  gem 'database_cleaner-mongoid'
  # ... existing test gems
end
```

### 3. Install Dependencies

```bash
bundle install
```

## Configuration

### 1. Generate Rails Structure

```bash
# Create Rails directories
mkdir -p config/environments
mkdir -p config/initializers
mkdir -p app/controllers/concerns
mkdir -p app/channels/application_cable
mkdir -p app/views/layouts
mkdir -p app/assets/{stylesheets,javascripts,images}
mkdir -p spec/requests
mkdir -p spec/channels
```

### 2. Create Rails Application Config

Create `config/application.rb`:

```ruby
require_relative "boot"
require "rails"

# Pick the frameworks you want:
require "action_controller/railtie"
require "action_view/railtie"
require "action_cable/engine"
require "rails/test_unit/railtie"
require "sprockets/railtie" if defined?(Sprockets)

# Require existing app code
require_relative '../repos/repos_index'
require_relative '../infrastructure/actions_index'
require_relative '../services/services_index'
require_relative '../lib/libs_index'
require_relative '../workers/workers_index'
require_relative '../handling'

Bundler.require(*Rails.groups)

module Orfheo
  class Application < Rails::Application
    config.load_defaults 8.1
    
    # API-only would be config.api_only = true, but we have views
    config.api_only = false
    
    # Autoload paths for existing structure
    config.autoload_paths += %W(
      #{config.root}/repos
      #{config.root}/infrastructure
      #{config.root}/services
      #{config.root}/lib
      #{config.root}/workers
    )
    
    # Middleware stack
    config.middleware.use Rack::Deflater
    config.middleware.insert_before ActionDispatch::ShowExceptions, MyExceptionHandling
    
    # CORS
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost'
        resource '*', headers: :any, methods: [:get, :post, :put, :patch, :delete, :options]
      end
    end
    
    # Session store
    config.session_store :cookie_store, key: '_orfheo_session'
    
    # Don't generate Rails defaults for controllers
    config.generators do |g|
      g.assets false
      g.helper false
      g.test_framework :rspec
    end
  end
end
```

### 3. Create Environment Configs

Create `config/environments/development.rb`:

```ruby
require "active_support/core_ext/integer/time"

Rails.application.configure do
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.server_timing = true
  
  # Asset pipeline
  config.assets.debug = true
  config.assets.quiet = true
  
  # Action Cable
  config.action_cable.disable_request_forgery_protection = true
  
  # Logging
  config.log_level = :debug
  config.log_tags = [:request_id]
end
```

Create `config/environments/test.rb` and `config/environments/production.rb` similarly.

### 4. Create MongoDB Initializer

Create `config/initializers/mongodb.rb`:

```ruby
# MongoDB connection
mongo_uri = ENV['MONGOLAB_URI'] || 'mongodb://localhost:27017/orfheo_development'
mongo_uri = 'mongodb://localhost:27017/cg_test' if Rails.env.test?

$mongo_client = Mongo::Client.new(mongo_uri)
$db = $mongo_client.database
```

### 5. Create Sidekiq Initializer

Create `config/initializers/sidekiq.rb`:

```ruby
Sidekiq.configure_server do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end
```

### 6. Create Action Cable Config

Create `config/cable.yml`:

```yaml
development:
  adapter: redis
  url: redis://localhost:6379/1

test:
  adapter: test

production:
  adapter: redis
  url: <%= ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } %>
  channel_prefix: orfheo_cable_production
```

### 7. Create Routes

Create `config/routes.rb`:

```ruby
Rails.application.routes.draw do
  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
  
  # Root
  root 'welcome#index'
  
  # Login
  post '/login', to: 'sessions#create'
  delete '/login', to: 'sessions#destroy'
  get '/login', to: 'sessions#show'
  
  # RESTful resources
  resources :users, defaults: {format: :json}
  resources :events, defaults: {format: :json} do
    resources :programs, only: [:index, :create, :update, :destroy]
    resources :activities, only: [:index, :create, :update, :destroy]
  end
  resources :profiles, defaults: {format: :json}
  resources :productions, defaults: {format: :json}
  resources :spaces, defaults: {format: :json}
  resources :calls, defaults: {format: :json}
  resources :forms, defaults: {format: :json}
  resources :free_blocks, defaults: {format: :json}
  
  # Search
  scope '/search', module: :search, defaults: {format: :json} do
    get '/', to: 'search#index'
    get '/suggest', to: 'suggest#index'
  end
  
  # Admin
  namespace :admin, defaults: {format: :json} do
    root to: 'admin#index'
    resources :tags
    resources :ambients
    resources :galleries
    resources :admins, only: [:index, :create, :destroy]
    resources :assets
    resources :participants
  end
  
  # Participant
  namespace :participant, defaults: {format: :json} do
    # Participant routes
  end
  
  # Action Cable
  mount ActionCable.server => '/cable'
end
```

### 8. Update config.ru

Replace existing `config.ru`:

```ruby
# This file is used by Rack-based servers to start the application.

require_relative "config/environment"

run Rails.application
Rails.application.load_server
```

### 9. Create Boot File

Create `config/boot.rb`:

```ruby
ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup' # Set up gems listed in the Gemfile.
```

### 10. Create Environment File

Create `config/environment.rb`:

```ruby
# Load the Rails application.
require_relative "application"

# Initialize the Rails application.
Rails.application.initialize!
```

## Running the Application

### 1. Start MongoDB

```bash
# In separate terminal
mongod
```

### 2. Start Redis

```bash
# In separate terminal
redis-server
```

### 3. Start Rails Server

```bash
# Development server
rails server
# Or with Puma config
bundle exec puma -C config/puma.rb

# Server will start on http://localhost:3000
```

### 4. Start Sidekiq (Optional)

```bash
# In separate terminal
bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb
```

### 5. Start React Webpack Watch (Optional)

```bash
# In separate terminal
cd assets/reactjs
npm run build-watch
```

## Validation

### Check Server Status

```bash
curl http://localhost:3000/up
# Should return: status: ok
```

### Check Routes

```bash
rails routes
# Should display all configured routes
```

### Check Console

```bash
rails console

# Test MongoDB connection
Repos::Users.collection.name  # Should return "users"

# Test repository pattern
Repos::Users.all  # Should return users from MongoDB
```

### Run Tests

```bash
# Run RSpec tests
bundle exec rspec

# Run specific test
bundle exec rspec spec/requests/users_spec.rb
```

### Run Cypress E2E Tests

```bash
# In separate terminal, ensure server is running
npm run cypress:open
# Or headless
npm run cypress:run
```

## Development Workflow

### 1. Create New Controller

```bash
# Generate controller
rails generate controller Users index show create update destroy --skip-routes --skip-helper --skip-assets

# Edit app/controllers/users_controller.rb
# Add routes to config/routes.rb
```

### 2. Create New Action Cable Channel

```bash
# Generate channel
rails generate channel Event

# Edit app/channels/event_channel.rb
```

### 3. Run Tests After Changes

```bash
# Run all tests
bundle exec rspec

# Run with coverage
COVERAGE=true bundle exec rspec

# Watch mode (optional, requires guard gem)
bundle exec guard
```

## Troubleshooting

### MongoDB Connection Issues

```ruby
# Check in rails console
$mongo_client.cluster.servers.first.summary
# Should show connected: true
```

### Asset Pipeline Issues

```bash
# Clear asset cache
rake tmp:cache:clear

# Recompile assets
rake assets:precompile
```

### Session Issues

```bash
# Check session secret is set
rails credentials:show
# Or check environment variable
echo $SECRET_KEY_BASE
```

### Action Cable Connection Issues

```ruby
# Check Redis connection in rails console
Redis.new(url: 'redis://localhost:6379/1').ping
# Should return "PONG"
```

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

## Next Steps

1. **Migrate Controllers**: Start with P1 user story (welcome page)
2. **Run Tests**: Validate each migration step
3. **Iterate**: Move through P2-P7 user stories incrementally
4. **Deploy**: Follow production deployment guide after all stories complete

## Useful Commands

```bash
# Rails console
rails console

# Rails routes
rails routes

# Rails middleware stack
rails middleware

# Database console (MongoDB)
mongo

# Generate secret key
rails secret

# Rails info
rails about
```

## Resources

- Rails 8.1 Guides: https://guides.rubyonrails.org/
- Action Cable Guide: https://guides.rubyonrails.org/action_cable_overview.html
- MongoDB Ruby Driver: https://www.mongodb.com/docs/ruby-driver/current/
- Puma Configuration: https://github.com/puma/puma
