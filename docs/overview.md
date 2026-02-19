# 1. Top-Level Directory Structure

```text
/Users/a0794511/projects/orfheo/
├── .env                    # Environment variables (local)
├── .env.production         # Environment variables (production)
├── .git/
├── .github/
├── .gitignore
├── .rspec
├── AGENTS.md               # Copilot instructions
├── DEPLOYMENT.md
├── MIGRATION.md
├── Gemfile                 # Ruby dependencies (Rails 8.1.2, MongoDB, etc.)
├── Gemfile.lock
├── LICENSE
├── Procfile
├── README.md
├── Rakefile
├── app/                    # *** Rails app directory (NEW - migration target) ***
│   ├── assets/
│   ├── channels/
│   ├── controllers/        # Rails controllers (migrated from Sinatra)
│   ├── mailers/
│   └── views/
├── assets/                 # Frontend (React webpack build)
├── bin/
├── config/                 # Rails configuration
│   ├── application.rb
│   ├── boot.rb
│   ├── cable.yml
│   ├── environment.rb
│   ├── environments/
│   ├── initializers/
│   ├── puma.rb
│   └── routes.rb
├── config.ru               # Rack entrypoint (now boots Rails)
├── cypress/                # Cypress E2E tests
├── cypress.json
├── exceptions.rb           # Pard::Invalid / Pard::Unexisting exception hierarchy
├── handling.rb             # Rack middleware for exception -> JSON responses
├── helpers.rb
├── infrastructure/         # *** Domain logic (preserved from Sinatra) ***
│   ├── actions/            # Actions::* classes (18 files)
│   └── actions_index.rb
├── lib/                    # *** Domain libraries (preserved from Sinatra) ***
│   ├── cache/
│   ├── storage.rb          # ApiStorage - collection->class name mapping
│   ├── util.rb
│   └── ... (activities, calls, events, profiles, etc.)
├── log/
├── openapi/
├── public/
├── repos/                  # *** MongoDB repository layer (preserved from Sinatra) ***
│   ├── repos_factory.rb    # Dynamic repo class builder + BaseReposMethods
│   ├── repos_index.rb
│   ├── meta_repos/
│   └── ... (users.rb, events.rb, profiles.rb, etc.)
├── services/               # WebSocket, etc.
├── spec/                   # RSpec test suite
├── specs/                  # (appears to be an older/alternate test dir)
├── tmp/
├── updaters/
├── vendor/
└── workers/                # Sidekiq workers
```

**Key observation:**
This is **NOT** a Sinatra app anymore. It is a **Rails 8.1.2** app migrated from Sinatra.

The legacy Sinatra architecture (`repos`, `infrastructure/actions`, `lib`, `exceptions`, `handling`) is preserved and loaded via Rails initializers. Controllers have been rewritten as `ActionController::Base` subclasses.

---

# 2. `spec/` Directory Structure

```text
/Users/a0794511/projects/orfheo/spec/
├── app/
│   └── app_spec.rb
├── channels/
├── controllers/                    # Legacy Sinatra-style controller specs (Rack::Test)
│   ├── activities_spec.rb
│   ├── admin_spec.rb
│   ├── artistproposals_spec.rb
│   ├── calls_spec.rb
│   ├── concerns/
│   ├── events_spec.rb
│   ├── forms_spec.rb
│   ├── free_blocks_spec.rb
│   ├── login_spec.rb
│   ├── metacontrollers/
│   ├── participants_spec.rb
│   ├── productions_spec.rb
│   ├── profiles_spec.rb
│   ├── programs_spec.rb
│   ├── search_spec.rb
│   ├── spaceproposals_spec.rb
│   ├── spaces_spec.rb
│   ├── users_spec.rb
│   └── welcome_spec.rb
├── infrastucture/                  # (note: typo in dir name "infrastucture")
│   ├── activities_spec.rb
│   ├── admin_spec.rb
│   ├── contact_mails_spec.rb
│   ├── db_elements_spec.rb
│   ├── galleries_assets_spec.rb
│   └── users_spec.rb
├── lib/
├── mailers/
├── rack_session_helper.rb
├── rails_compatibility_spec.rb
├── rails_helper.rb                 # Rails-specific RSpec config (NEW)
├── repos/                          # Repository unit specs
│   ├── repos_factory_spec.rb
│   ├── activities_spec.rb
│   ├── ... (one per repo)
│   └── metarepos/
├── requests/                       # Rails request specs (NEW - integration tests)
│   ├── activities_spec.rb
│   ├── admin/
│   ├── authentication_spec.rb
│   ├── calls_spec.rb
│   ├── events_spec.rb
│   ├── forms_spec.rb
│   ├── free_blocks_spec.rb
│   ├── productions_spec.rb
│   ├── profiles_spec.rb
│   ├── programs_spec.rb
│   ├── proposals_spec.rb
│   ├── search_spec.rb
│   ├── spaces_spec.rb
│   ├── users_spec.rb
│   └── welcome_spec.rb
├── services/
├── shared_definitions.rb           # Shared test data (routes, IDs, fixtures)
├── spec_helper.rb                  # Base RSpec config
├── support/
│   ├── db_tools.rb                 # Mongo cleanup helpers
│   ├── test_data_helpers.rb        # Factory methods for request specs
│   └── test_session_middleware.rb  # Test session middleware
└── workers/
```

**Key observation:** Two parallel test suites exist:

* `spec/controllers/` → Legacy Sinatra-style specs using `Rack::Test::Methods`
* `spec/requests/` → New Rails request specs using `ActionDispatch::IntegrationTest`

---

# 3. Key File Contents

## `spec/spec_helper.rb` (137 lines)

### Key Points

* Sets:

  * `RACK_ENV = test`
  * `MONGOLAB_URI = mongodb://localhost:27017/cg_test`
* Loads full Rails environment via `config/environment`
* Defines:

  * `def app` → returns `Rails.application` (Rack::Test compatibility)
  * `def session`
  * `def parsed_response`
* Globally includes `Rack::Test::Methods`
* Stubs Cloudinary in every test
* Initializes Mongo client in `before(:all)`
* Clears `CachedEvent`
* Configures RSpec expectations and mocks

---

## `spec/rails_helper.rb` (67 lines)

### Key Points

* Requires `spec_helper` first
* Aborts if Rails runs in production
* Uses `database_cleaner-mongo` with `:deletion` strategy
* Cleans DB before each test
* Includes `ActionDispatch::IntegrationTest::Behavior` for request specs
* Provides:

  * `parsed_response` (symbolized keys)
  * `json_response` (string keys)
* Resets `TestSessionMiddleware` before each request spec
* Infers spec type from file location

---

## `config/application.rb` (92 lines)

### Key Points

* Rails 8.1
* No ActiveRecord (Mongo only)
* Uses:

  * `mongo` gem
  * Custom `MyExceptionHandling` middleware
  * `Rack::Cors`
  * `Rack::Deflater`
* React webpack build added to asset paths
* Cookie session store
* SMTP ActionMailer configuration
* No Zeitwerk autoloading for legacy code

---

## `Gemfile` (61 lines)

### Core Stack

* Ruby 3.4.4
* Rails 8.1.2
* Mongo via `mongo` gem (no Mongoid)
* Puma
* Redis
* Sidekiq
* Action Cable
* Cloudinary
* BCrypt
* Sprockets

### Testing

* rspec-rails 7.0
* database_cleaner-mongo
* rack-test
* awesome_print

---

# 4. `repos/` Structure

```text
repos/
├── repos_factory.rb
├── repos_index.rb
├── meta_repos/
│   ├── base.rb
│   └── meta_repos.rb
├── activities.rb
├── calls.rb
├── events.rb
├── forms.rb
├── free_blocks.rb
├── productions.rb
├── profiles.rb
├── programs.rb
├── proposals.rb
├── search.rb
├── spaces.rb
└── users.rb
```

## How `ReposFactory` Works

1. `ReposFactory.new(MONGO_CLIENT).build` runs in an initializer.
2. Iterates over `ApiStorage.hash_for_building_repo`
3. Dynamically creates `Repos::ClassName`
4. Sets `@@collection`
5. Extends:

   * `BaseReposMethods`
   * Optional `ExtraReposMethods::ClassName`
6. All methods are class-level.

Usage example:

```ruby
Repos::Users.get_by_id(id)
```

---

# 5. `infrastructure/actions/`

```text
infrastructure/actions/
├── activities.rb
├── admin.rb
├── calls.rb
├── db_element.rb
├── events.rb
├── forms.rb
├── free_blocks.rb
├── galleries.rb
├── mails.rb
├── participants.rb
├── productions.rb
├── profiles.rb
├── program.rb
├── proposals.rb
├── search.rb
├── spaces.rb
├── tags.rb
└── users.rb
```

* Defines `Actions::*` classes
* Entry point: `self.run(...)`
* Orchestrates business logic
* Calls `Repos::*`

---

# 6. `app/controllers/` (Rails Layer)

```text
app/controllers/
├── application_controller.rb
├── concerns/
│   ├── admin/
│   ├── guards.rb
│   ├── scopify.rb
│   └── websocket_helpers.rb
├── activities_controller.rb
├── admin/
├── artist_proposals_controller.rb
├── calls_controller.rb
├── events_controller.rb
├── forms_controller.rb
├── free_blocks_controller.rb
├── participant/
├── productions_controller.rb
├── profiles_controller.rb
├── programs_controller.rb
├── search/
├── sessions_controller.rb
├── space_proposals_controller.rb
├── spaces_controller.rb
├── users_controller.rb
└── welcome_controller.rb
```

### `ApplicationController`

* Inherits from `ActionController::Base`
* CSRF disabled
* Includes:

  * `Scopify`
  * `Guards`
  * `WebsocketHelpers`
* Defines:

  * `success(payload)`
  * `rescue_from Pard::*`
  * `current_user_id`
  * `logged_in?`
  * `symbolize_params` (before_action)

---

# 7. Architectural Summary

This is a **Rails 8.1.2 (Ruby 3.4.4)** app migrated from Sinatra.

| Layer              | Technology                   | Location                               |
| ------------------ | ---------------------------- | -------------------------------------- |
| Web framework      | Rails 8.1.2                  | `app/controllers/`, `config/routes.rb` |
| Database           | MongoDB (mongo gem)          | `repos/`                               |
| Domain logic       | `Actions::*` service objects | `infrastructure/actions/`              |
| Domain libraries   | Pure Ruby modules            | `lib/`                                 |
| Exception handling | `Pard::*` + Rack middleware  | `exceptions.rb`, `handling.rb`         |
| Background jobs    | Sidekiq + Redis              | `workers/`                             |
| Realtime           | Action Cable                 | `app/channels/`, `services/`           |
| Frontend           | React (webpack)              | `assets/reactjs/`                      |
| Tests              | RSpec 7 + rspec-rails        | `spec/`                                |

---

## Boot Sequence

1. `config.ru`
2. `config/environment.rb`
3. `config/application.rb`
4. `000_mongodb.rb` initializer → creates `MONGO_CLIENT`, sets `$db`
5. `load_sinatra_config.rb` initializer:

   * Requires legacy code
   * Builds `Repos::*` dynamically
6. Routes map to Rails controllers
7. Controllers → `Actions::*` → `Repos::*`

