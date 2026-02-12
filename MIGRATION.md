# Migration Guide: Sinatra to Rails 8.1.2

This document outlines the changes and new conventions introduced during the migration of Orfheo from a Sinatra-based setup to Rails 8.1.2.

## Major Changes
### 1. Web Framework
- **Old**: Sinatra 4.x
- **New**: Rails 8.1.2
- **Action**: All controllers have been moved from `controllers/` to `app/controllers/`. Logic in `infrastructure/actions` remains but has been refactored to be framework-agnostic.

### 2. Real-time Communication (WebSockets)
- **Old**: Faye::WebSocket at `/websocket`
- **New**: Action Cable at `/cable`
- **Breaking Change**: The WebSocket endpoint URL and protocol have changed. React client now uses the `@rails/actioncable` library.

### 3. Asset Pipeline
- **Old**: Sinatra Asset Pipeline + Sprockets
- **New**: Rails Sprockets-rails + Asset Pipeline
- **Changes**: Assets are now fingerprinted in production for cache-busting. Always use Rails helpers like `javascript_include_tag` and `stylesheet_link_tag`.

### 4. Sessions & Authentication
- **Breaking Change**: The `SESSION_SECRET` has been replaced by Rails `SECRET_KEY_BASE`. This will force all currently logged-in users to re-authenticate upon deployment.

## Environment Variables
The following environment variables are required:
- `SECRET_KEY_BASE`: Used for secure session management.
- `MONGOLAB_URI`: Connection string for MongoDB.
- `REDIS_URL`: Connection string for Redis (used by Action Cable and Sidekiq).

## Architecture
- **Controllers**: Located in `app/controllers/`. Inherit from `ApplicationController`.
- **Legacy Logic**: Business logic is still held in `repos/`, `services/`, and `infrastructure/`. These are manually loaded in `config/initializers/load_sinatra_config.rb` because they do not follow Zeitwerk naming conventions.
- **Workers**: Sidekiq workers are located in `workers/`.
