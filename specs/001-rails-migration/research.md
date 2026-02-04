# Research: Rails Migration

**Phase**: 0 (Research & Resolution)  
**Date**: 2026-01-30  
**Plan**: [plan.md](plan.md)  
**Status**: Complete

## Overview

This document captures research findings and decisions for migrating Orfheo from Sinatra to Rails 8.1.2. Each section addresses a technical unknown from the implementation plan and provides a clear decision with rationale.

---

## 1. Rails 8.1.2 Setup & Configuration

### Decision
Use **gradual integration approach** - add Rails gems and structure incrementally around existing codebase, then replace Sinatra piece by piece.

### Rationale
- Minimizes risk by allowing iterative migration and testing
- Preserves existing structure (`repos/`, `infrastructure/`, `lib/`) which is framework-agnostic
- Allows running both frameworks temporarily if needed for validation
- Avoids massive "rails new" that would require copying everything over
- Enables incremental cutover per user story (P1 → P2 → P3 → ...)

### Alternatives Considered

**Option A: `rails new` (clean start)** - Rejected because:
- Requires recreating all custom directory structures
- Forces immediate migration of all 20+ controllers
- No gradual validation path
- High risk of breaking working code

**Option B: Dual framework running simultaneously** - Rejected because:
- Adds unnecessary complexity
- Conflicts with big-bang deployment strategy
- Session/state synchronization issues
- Not maintainable long-term

**Option C: Gradual integration (CHOSEN)** - Selected because:
- Lowest risk, incremental validation
- Preserves clean architecture
- Supports big-bang deployment (migrate all, test, deploy once)
- Rails can coexist in development during migration work

### Implementation Notes
- Add `rails` gem to Gemfile, run `bundle install`
- Generate Rails structure: `rails app:template LOCATION=path/to/template.rb` or manually create `/config`, `/app` directories
- Configure `config/application.rb` to use existing autoload paths for `repos/`, `infrastructure/`, `services/`
- Replace `config.ru` Sinatra rack up with Rails application mounting
- Keep both frameworks briefly in development for parallel testing, then remove Sinatra after validation

---

## 2. MongoDB Integration with Rails 8.1.2

### Decision
Continue using **direct mongo gem** (v2.8+) with existing `Repos::*` pattern - do NOT adopt Mongoid.

### Rationale
- Existing repository pattern is well-established and framework-agnostic
- Mongo gem 2.8+ works perfectly with Rails 8.1.2 (no ActiveRecord required)
- Zero changes needed to 12+ repository classes
- Avoids Mongoid's ActiveRecord-like patterns that conflict with explicit repository architecture
- Maintains clear separation between domain layer and framework

### Alternatives Considered

**Option A: Mongoid (ODM with ActiveRecord-like API)** - Rejected because:
- Requires rewriting all `Repos::*` classes to Mongoid models
- Introduces ActiveRecord patterns (inheritance, callbacks) that violate clean architecture
- Adds unnecessary abstraction layer
- Current repository pattern already provides needed functionality
- Would force domain models to inherit from Mongoid::Document

**Option B: Rails ActiveRecord + MongoDB adapter** - Rejected because:
- Rails 8 doesn't officially support MongoDB via ActiveRecord
- Third-party adapters are poorly maintained
- Forces ActiveRecord conventions onto document database
- Current mongo gem is more idiomatic for MongoDB

**Option C: Direct mongo gem (CHOSEN)** - Selected because:
- Already in use, proven stable
- Framework-agnostic (works with Sinatra, works with Rails)
- Repository pattern encapsulates all data access
- Zero migration cost for data layer
- Rails controllers can call `Repos::*` directly as they do now

### Implementation Notes
- Keep `mongo` gem in Gemfile, maintain version 2.8+
- Configure MongoDB connection in `config/initializers/mongodb.rb` (move from `config/config.rb`)
- Preserve `repos/repos_factory.rb` dynamic class generation
- Rails controllers use `Repos::Users.find(id)` pattern directly
- No need for `config/mongoid.yml` or ActiveModel integration
- Connection established in initializer, available globally

---

## 3. Controller Migration Pattern

### Decision
Translate Sinatra controllers to Rails **ActionController::Base** subclasses with concerns for shared behavior (scopify, guards).

### Rationale
- Rails controllers provide richer features (strong parameters, filters, responders)
- Concerns (`app/controllers/concerns/`) encapsulate shared behavior cleanly
- Maintains 1:1 mapping (1 Sinatra controller → 1 Rails controller)
- Sinatra DSL (get, post, before) maps naturally to Rails (actions, before_action)
- Preserves existing action logic (business logic stays in `infrastructure/actions/`)

### Alternatives Considered

**Option A: Keep Sinatra controllers, mount in Rails** - Rejected because:
- Defeats purpose of Rails migration
- Misses Rails controller benefits (strong params, CSRF protection, etc.)
- Creates hybrid complexity
- Doesn't solve framework-specific issues

**Option B: Direct translation without concerns** - Rejected because:
- Duplicates shared behavior (scopify, guards) across 20+ controllers
- Violates DRY principle
- Harder to maintain consistency

**Option C: Rails controllers with concerns (CHOSEN)** - Selected because:
- Concerns provide clean abstraction for shared behavior
- Rails standard pattern for mixins
- Easy to test in isolation
- Maintains separation of concerns

### Implementation Notes

**BaseController → ApplicationController**:
```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  include Scopify           # Port from controllers/base.rb
  include Guards            # Port check_admin!, check_event_ownership!, etc.
  include WebSocketHelpers  # Port send_web_socket_message
  
  before_action :symbolize_params
  
  private
  
  def symbolize_params
    params.transform_keys(&:to_sym)
  end
end
```

**Concerns**:
- `app/controllers/concerns/scopify.rb` - Port scopify helper for param accessors
- `app/controllers/concerns/guards.rb` - Port authentication/authorization guards
- `app/controllers/concerns/websocket_helpers.rb` - Port WebSocket message sending

**Controller actions**:
- Sinatra `get '/path'` → Rails `def show` / `def index` (RESTful)
- Sinatra `post '/path'` → Rails `def create`
- Sinatra `patch '/path/:id'` → Rails `def update`
- Sinatra `before { }` → Rails `before_action :method_name`
- Sinatra `params` → Rails `params.permit(...)`
- Sinatra `success(payload)` → Rails `render json: {status: 'success', ...}`

**Example migration**:
```ruby
# Before (Sinatra): controllers/users.rb
class UsersController < BaseController
  get '/:id' do
    scopify :id
    user = Repos::Users.find(id)
    success(user: user)
  end
end

# After (Rails): app/controllers/users_controller.rb
class UsersController < ApplicationController
  def show
    scopify :id
    user = Repos::Users.find(id)
    render json: {status: 'success', user: user}
  end
end
```

---

## 4. Action Cable Setup for WebSocket

### Decision
Migrate WebSocket functionality to **Rails Action Cable** with channel-based architecture.

### Rationale
- Action Cable is Rails 8's native WebSocket solution
- Integrated with Rails (automatic connection management, subscriptions)
- Cleaner channel abstraction than raw Faye::WebSocket
- Built-in pub/sub with Redis support (can use Sidekiq's Redis)
- Automatic reconnection handling
- Better testing support in Rails

### Alternatives Considered

**Option A: Keep Faye::WebSocket as Rack middleware** - Rejected because:
- Not Rails-idiomatic
- Manual connection management complexity
- Doesn't integrate with Rails' broadcasting system
- Requires custom subscription logic
- Harder to test

**Option B: AnyCable (Action Cable alternative)** - Rejected because:
- Adds deployment complexity (separate Go process)
- Overkill for current scale (100+ concurrent users)
- Action Cable sufficient for requirements (<2s message delivery)
- Premature optimization

**Option C: Action Cable (CHOSEN)** - Selected because:
- Rails standard, zero additional dependencies
- Clean channel abstraction
- Integrated broadcasting (ActionCable.server.broadcast)
- Redis adapter available (use existing Sidekiq Redis)
- Meets performance requirements (<2s delivery)

### Implementation Notes

**Connection setup**:
```ruby
# app/channels/application_cable/connection.rb
module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user
    
    def connect
      self.current_user = find_verified_user
    end
    
    private
    
    def find_verified_user
      # Authenticate via session or token
      if verified_user = User.find_by(id: cookies.encrypted[:user_id])
        verified_user
      else
        reject_unauthorized_connection
      end
    end
  end
end
```

**Channel per entity type**:
```ruby
# app/channels/event_channel.rb
class EventChannel < ApplicationCable::Channel
  def subscribed
    stream_from "event_#{params[:event_id]}"
  end
  
  def unsubscribed
    # Cleanup
  end
end
```

**Broadcasting from controllers/actions**:
```ruby
# In controllers or infrastructure/actions
ActionCable.server.broadcast(
  "event_#{event_id}",
  {event: 'updated', model: event_data}
)
```

**Configuration**:
- `config/cable.yml` - Redis adapter configuration (use Sidekiq Redis)
- Mount in routes: `mount ActionCable.server => '/cable'`
- JavaScript client connects to `/cable` instead of `/websocket`

**Migration from Services::Websocket**:
- Replace `Services::WsClients.send_message(channel, message, signature)` 
- With `ActionCable.server.broadcast(channel, message)`
- Update React client to use Action Cable JavaScript library
- Maintain message format for backward compatibility

---

## 5. Asset Pipeline Migration

### Decision
Use **Propshaft** (Rails 8 default) for basic asset serving + keep existing webpack for React build.

### Rationale
- Rails 8.1.2 uses Propshaft by default (lighter than Sprockets)
- Existing React build via webpack works independently (`assets/reactjs/package.json`)
- Propshaft handles basic CSS/images, webpack handles complex JS
- Avoids rewriting entire React build pipeline
- Separation of concerns: Rails serves simple assets, webpack bundles React

### Alternatives Considered

**Option A: Sprockets (classic Rails asset pipeline)** - Rejected because:
- Deprecated in Rails 8 (Propshaft is new default)
- Heavier, more complex than needed
- Slower compilation than Propshaft
- Still doesn't solve React integration

**Option B: Full migration to Vite/esbuild** - Rejected because:
- Requires rewriting entire React build configuration
- High risk of breaking React app
- Out of scope (spec excludes React changes)
- Existing webpack setup works

**Option C: Propshaft + webpack (CHOSEN)** - Selected because:
- Rails 8 default (Propshaft)
- Minimal changes to existing React build
- Clear separation: Propshaft for Rails assets, webpack for React
- Fastest path to migration
- Meets requirement: "React frontend without requiring React code changes"

### Implementation Notes

**Propshaft setup** (Rails 8.1.2 default):
```ruby
# Gemfile - already included with Rails 8
gem "propshaft"

# config/application.rb - already configured
config.assets.paths << Rails.root.join("app/assets")
```

**Webpack setup** (preserve existing):
```json
// assets/reactjs/package.json - keep as-is
{
  "scripts": {
    "build": "webpack --mode production",
    "build-watch": "webpack --mode development --watch"
  }
}
```

**Integration approach**:
1. Propshaft serves from `app/assets/` (CSS, images, legacy JS)
2. Webpack compiles React to `public/assets/reactjs/` (outside Propshaft)
3. Rails views reference webpack output: `<script src="/assets/reactjs/bundle.js">`
4. Keep webpack watch running in development: `npm run build-watch`
5. Production build: `npm run build` before `rails assets:precompile`

**Migration steps**:
- Move `assets/stylesheets/` → `app/assets/stylesheets/`
- Move `assets/images/` → `app/assets/images/`
- Keep `assets/javascripts/` as legacy JS in `app/assets/javascripts/`
- Keep `assets/reactjs/` at root (webpack builds to `public/assets/reactjs/`)
- Update views to use Rails helpers: `stylesheet_link_tag`, `image_tag`
- React bundles loaded via plain `<script>` tags (not Rails helpers)

---

## 6. Session Management & Authentication

### Decision
Use **cookie-based sessions** (Rails default) with forced session clearing at deployment.

### Rationale
- Rails encrypted cookies work out of the box
- No additional infrastructure (Redis, database) needed for sessions
- Clarification confirms forced re-authentication (all sessions cleared)
- BCrypt preservation is straightforward (stays in model/service layer)
- Meets requirement: "maintain existing authentication behavior"

### Alternatives Considered

**Option A: Database-backed sessions** - Rejected because:
- Adds unnecessary database load
- Not needed since sessions are cleared anyway
- Cookie sessions sufficient for scale (100+ concurrent users)
- More complex deployment

**Option B: Redis sessions** - Rejected because:
- Overkill for current requirements
- Adds Redis dependency for sessions (already using for Sidekiq)
- Complicates forced re-authentication (must flush Redis)
- Cookie sessions simpler

**Option C: Cookie-based sessions (CHOSEN)** - Selected because:
- Rails default, zero configuration
- Encrypted and signed automatically
- Forced re-authentication = don't migrate old sessions (clean slate)
- BCrypt password validation unchanged
- Simple deployment (no shared state)

### Implementation Notes

**Session configuration**:
```ruby
# config/initializers/session_store.rb
Rails.application.config.session_store :cookie_store, 
  key: '_orfheo_session',
  expire_after: 2.weeks

# config/application.rb
config.secret_key_base = ENV['SECRET_KEY_BASE']
```

**Authentication flow** (preserve existing logic):
```ruby
# app/controllers/login_controller.rb
def create
  user = Repos::Users.find_by_email(params[:email])
  if user && BCrypt::Password.new(user[:password]) == params[:password]
    session[:user_id] = user[:id]
    session[:identity] = user[:email]
    render json: {status: 'success', user: user}
  else
    render json: {status: 'fail', reason: 'invalid_credentials'}, status: :unauthorized
  end
end
```

**Guard methods** (preserve existing logic):
```ruby
# app/controllers/concerns/guards.rb
module Guards
  def current_user
    @current_user ||= Repos::Users.find(session[:user_id]) if session[:user_id]
  end
  
  def check_admin!
    raise Pard::Invalid::Admin unless admin?
  end
  
  def admin?
    MetaRepos::Admins.exists?(session[:identity])
  end
end
```

**Deployment session clearing**:
- Generate new `SECRET_KEY_BASE` for production
- All existing Sinatra sessions become invalid (can't decrypt with new key)
- Users redirected to login on first request post-migration
- Alternative: Add migration task that explicitly clears session data (not needed with cookie approach)

---

## 7. Routing Strategy

### Decision
Use **Rails resource routing with namespace blocks** to preserve 7 namespace structure and maintain URL compatibility.

### Rationale
- Rails routing DSL supports namespaces natively
- Can match exact Sinatra URLs with custom routes
- RESTful defaults where possible, custom routes where needed
- Clear organization matching Sinatra's `map '/namespace'` structure
- Backward compatible with existing API clients

### Alternatives Considered

**Option A: Pure RESTful resource routing** - Rejected because:
- Existing URLs don't follow REST conventions everywhere
- Would break API compatibility
- Requires API clients to update
- Violates requirement: "preserve all existing API endpoints"

**Option B: Mount Sinatra apps in Rails routes** - Rejected because:
- Defeats purpose of migration
- Keeps Sinatra dependency
- Hybrid complexity

**Option C: Namespace blocks with custom routes (CHOSEN)** - Selected because:
- Exact URL matching to Sinatra routes
- Clear namespace organization
- Rails-idiomatic while maintaining compatibility
- Easy to document mapping (Sinatra → Rails)

### Implementation Notes

**Route structure mapping**:
```ruby
# config/routes.rb

Rails.application.routes.draw do
  # Root namespace (/)
  root 'welcome#index'
  
  # /login namespace
  namespace :login, path: 'login', defaults: {format: :json} do
    post '/', to: 'sessions#create'
    delete '/', to: 'sessions#destroy'
  end
  
  # RESTful resources with custom routes
  resources :users, defaults: {format: :json} do
    member do
      patch :update_password
    end
  end
  
  resources :events, defaults: {format: :json} do
    resources :programs, only: [:index, :create, :update, :destroy]
  end
  
  resources :profiles, defaults: {format: :json}
  resources :productions, defaults: {format: :json}
  resources :spaces, defaults: {format: :json}
  
  # /search namespace
  scope :search, module: :search, defaults: {format: :json} do
    get '/', to: 'search#index'
    get '/suggest', to: 'search#suggest'
  end
  
  # /forms namespace
  resources :forms, defaults: {format: :json}
  
  # /admin namespace (restricted)
  namespace :admin, defaults: {format: :json} do
    root 'admin#index'
    resources :tags
    resources :ambients
    resources :galleries
    resources :admins, only: [:index, :create, :destroy]
  end
  
  # /participant namespace
  namespace :participant, defaults: {format: :json} do
    # Participant routes
  end
  
  # /assets handled by Rails asset pipeline
  # Propshaft serves /assets automatically
  
  # Action Cable
  mount ActionCable.server => '/cable'
end
```

**Namespace to controller mapping**:
- `/` → `WelcomeController` (app/controllers/welcome_controller.rb)
- `/login` → `Login::SessionsController` (app/controllers/login/sessions_controller.rb)
- `/users` → `UsersController`
- `/events` → `EventsController`
- `/search` → `Search::SearchController` (app/controllers/search/search_controller.rb)
- `/forms` → `FormsController`
- `/admin` → `Admin::*Controller` (app/controllers/admin/...)
- `/participant` → `Participant::*Controller`

**URL compatibility verification**:
- Generate route mapping document: Sinatra route → Rails route → Same URL? (yes/no)
- Test with existing API clients (curl, Postman, Cypress tests)
- Ensure HTTP verb + path combinations identical

---

## 8. Middleware Stack Preservation

### Decision
Configure Rails middleware stack via `config/application.rb` to include existing Rack middleware in correct order.

### Rationale
- Rails middleware stack is Rack-compatible
- Custom middleware (MyExceptionHandling) can be inserted at specific positions
- Rack::Deflater built into Rails (just enable)
- CORS handling via rack-cors gem or custom middleware
- Maintains exact behavior of current stack

### Alternatives Considered

**Option A: Rewrite middleware as Rails concerns** - Rejected because:
- Exception handling middleware is already Rack-compliant
- Works in both Sinatra and Rails
- No benefit to rewriting
- Higher risk of bugs

**Option B: Keep separate config.ru with middleware** - Rejected because:
- Rails expects middleware in application config
- Fragmented configuration
- Not Rails-idiomatic

**Option C: Configure in application.rb (CHOSEN)** - Selected because:
- Rails standard approach
- Clear middleware ordering
- Easy to test and maintain
- Preserves existing middleware code

### Implementation Notes

**Middleware configuration**:
```ruby
# config/application.rb

module Orfheo
  class Application < Rails::Application
    # ...
    
    # Compression (was: use Rack::Deflater)
    config.middleware.use Rack::Deflater
    
    # Custom exception handling (was: use MyExceptionHandling)
    # Place BEFORE ActionDispatch::ShowExceptions to catch first
    config.middleware.insert_before ActionDispatch::ShowExceptions, MyExceptionHandling
    
    # CORS (was: in before block)
    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins 'http://localhost'
        resource '*', 
          headers: :any, 
          methods: [:get, :post, :put, :patch, :delete, :options]
      end
    end
    
    # Keep existing middleware files
    require_relative '../../handling'  # MyExceptionHandling class
  end
end
```

**Exception handling preservation**:
```ruby
# handling.rb - keep as-is, already Rack middleware
class MyExceptionHandling
  def initialize(app)
    @app = app
  end
  
  def call(env)
    @app.call(env)
  rescue Pard::Invalid => e
    # Return JSON error response
    [200, {'Content-Type' => 'application/json'}, 
     [{status: 'fail', reason: e.message}.to_json]]
  rescue Pard::Unexisting => e
    [404, {'Content-Type' => 'application/json'}, 
     [{status: 'fail', reason: 'not_found'}.to_json]]
  # ... other exception handling
  end
end
```

**Middleware order verification**:
- Run `rails middleware` to see full stack
- Ensure custom middleware in correct position (before Rails' error handlers)
- Test exception handling still produces consistent JSON responses

---

## 9. Test Suite Adaptation

### Decision
Use **Rails test helpers + RSpec request specs** for controller tests, preserve existing unit tests unchanged.

### Rationale
- RSpec request specs integrate cleanly with Rails
- Repository and service layer tests unchanged (framework-agnostic)
- Request specs provide better integration testing than controller specs
- Minimal changes achieve 95%+ passage target
- Cypress E2E tests unchanged (test from browser perspective)

### Alternatives Considered

**Option A: Rewrite all tests for Rails** - Rejected because:
- Unnecessary for framework-agnostic code (repos, services, actions)
- High effort, high risk
- Violates "minimal modifications" requirement
- Unit tests for business logic don't need Rails

**Option B: Controller specs (RSpec)** - Rejected because:
- Rails community moved away from controller specs
- Request specs preferred (test full stack)
- Controller specs don't test routing
- More brittle

**Option C: Request specs for controllers only (CHOSEN)** - Selected because:
- Rails standard for controller testing
- Tests full request/response cycle including routing
- Minimal changes to existing test structure
- Business logic tests unchanged
- Achieves 95%+ target with least effort

### Implementation Notes

**RSpec configuration**:
```ruby
# spec/rails_helper.rb (new file)
require 'spec_helper'
require File.expand_path('../config/environment', __dir__)
require 'rspec/rails'

RSpec.configure do |config|
  config.use_transactional_fixtures = false  # MongoDB doesn't use transactions
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!
  
  # Include request helpers
  config.include Rack::Test::Methods, type: :request
  
  # Database cleaner for MongoDB
  config.before(:suite) do
    DatabaseCleaner[:mongo].strategy = :deletion
  end
  
  config.before(:each) do
    DatabaseCleaner[:mongo].start
  end
  
  config.after(:each) do
    DatabaseCleaner[:mongo].clean
  end
end
```

**Request spec migration**:
```ruby
# Before (Sinatra): spec/controllers/users_spec.rb
describe UsersController do
  let(:app) { UsersController }
  
  it 'returns user' do
    get '/123'
    expect(last_response.status).to eq(200)
  end
end

# After (Rails): spec/requests/users_spec.rb
require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  it 'returns user' do
    get '/users/123'
    expect(response.status).to eq(200)
    expect(response.content_type).to match(/json/)
  end
end
```

**Test suite structure**:
- `spec/rails_helper.rb` - Rails integration (new)
- `spec/spec_helper.rb` - Non-Rails tests (unchanged)
- `spec/requests/` - Controller request specs (migrated from controller specs)
- `spec/channels/` - Action Cable channel specs (new)
- `spec/lib/` - Utility tests (unchanged)
- `spec/repos/` - Repository tests (unchanged, use spec_helper.rb)
- `spec/infrastructure/` - Action tests (unchanged, use spec_helper.rb)
- `spec/services/` - Service tests (unchanged, use spec_helper.rb)

**Cypress tests**:
- Keep `cypress.json` configuration
- Update base URL if needed (should still be `http://localhost:3000`)
- No changes to test files (test from browser, framework-agnostic)
- Run after Rails migration to validate E2E functionality

**Test passage strategy**:
1. Run existing test suite, note failures
2. Migrate controller specs → request specs (expect ~80% to pass immediately)
3. Fix routing issues (URLs changed)
4. Fix response format issues (Rails JSON slightly different)
5. Add channel specs for WebSocket (new functionality)
6. Target: 95%+ of original tests passing + new channel tests

---

## 10. Background Jobs & Sidekiq

### Decision
Keep **direct Sidekiq integration** without wrapping in ActiveJob.

### Rationale
- Existing Sidekiq workers are framework-agnostic
- Direct Sidekiq provides more features than ActiveJob
- ActiveJob is abstraction layer (unnecessary when only using Sidekiq)
- Zero changes needed to worker code
- Meets requirement: "maintain Sidekiq integration"

### Alternatives Considered

**Option A: Wrap workers in ActiveJob** - Rejected because:
- Adds unnecessary abstraction
- Limits access to Sidekiq-specific features (retries, scheduling)
- Requires rewriting all workers
- No benefit (not switching job backends)

**Option B: Replace Sidekiq with ActiveJob + different backend** - Rejected because:
- Out of scope (spec says maintain Sidekiq)
- High risk, no benefit
- Existing workers proven stable

**Option C: Direct Sidekiq (CHOSEN)** - Selected because:
- Already working, zero changes
- Framework-agnostic worker code
- Rails can use Sidekiq directly
- Configuration moves to initializer

### Implementation Notes

**Sidekiq configuration**:
```ruby
# config/initializers/sidekiq.rb

Sidekiq.configure_server do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end

Sidekiq.configure_client do |config|
  config.redis = { url: ENV['REDIS_URL'] || 'redis://localhost:6379/0' }
end

# Load workers
require_relative '../../workers/workers_index'
```

**Worker preservation**:
```ruby
# workers/sidekiq_workers.rb - keep as-is
class EmailWorker
  include Sidekiq::Worker
  
  def perform(user_id, email_type)
    # Business logic unchanged
  end
end
```

**Enqueuing from controllers/actions**:
```ruby
# In controllers or infrastructure/actions - unchanged
EmailWorker.perform_async(user.id, 'welcome')

# Or with scheduling - unchanged
EmailWorker.perform_in(1.hour, user.id, 'reminder')
```

**Redis usage**:
- Sidekiq continues using Redis (existing configuration)
- Action Cable can share same Redis for pub/sub
- Configure in `config/cable.yml`:
  ```yaml
  production:
    adapter: redis
    url: <%= ENV.fetch("REDIS_URL", "redis://localhost:6379/1") %>
    channel_prefix: orfheo_cable_production
  ```

**Running workers**:
```bash
# Same command as before
bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb

# Or in Procfile (unchanged)
worker: bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb
web: bundle exec puma -C config/puma.rb
```

---

## Summary of Decisions

| Research Task | Decision | Key Rationale |
|---------------|----------|---------------|
| 1. Rails Setup | Gradual integration | Lowest risk, incremental validation |
| 2. MongoDB Integration | Direct mongo gem | Preserve repository pattern, zero changes |
| 3. Controller Migration | ActionController + concerns | Rails standard, shared behavior via concerns |
| 4. WebSocket | Rails Action Cable | Native Rails, clean channel abstraction |
| 5. Asset Pipeline | Propshaft + webpack | Rails 8 default + preserve React build |
| 6. Sessions | Cookie-based, forced re-auth | Rails default, clean slate deployment |
| 7. Routing | Namespace blocks + custom routes | Exact URL compatibility, Rails-idiomatic |
| 8. Middleware | Configure in application.rb | Rails standard, preserve existing middleware |
| 9. Testing | Request specs for controllers | Rails standard, minimal changes |
| 10. Background Jobs | Direct Sidekiq | Zero changes, framework-agnostic workers |

## Technical Stack Summary

**Framework**: Rails 8.1.2 with Puma webserver  
**Database**: MongoDB via direct mongo gem (2.8+)  
**Real-time**: Rails Action Cable with Redis adapter  
**Assets**: Propshaft (Rails assets) + webpack (React)  
**Sessions**: Encrypted cookie store  
**Background Jobs**: Sidekiq (direct, not via ActiveJob)  
**Testing**: RSpec request specs + Cypress E2E

## Next Steps

With all research complete and decisions documented, proceed to **Phase 1: Design & Contracts**:
1. Generate `quickstart.md` - Rails 8.1.2 setup instructions
2. Generate `contracts/routes.md` - Sinatra → Rails route mappings
3. Update agent context with Rails 8.1.2 stack
4. Re-validate Constitution Check post-design
5. Ready for `/speckit.tasks` to generate implementation task list
