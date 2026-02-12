# Tasks: Rails Migration

**Feature**: Sinatra → Rails 8.1.2 Migration  
**Branch**: `001-rails-migration`  
**Generated**: 2026-01-30

**Input**: Design documents from `/specs/001-rails-migration/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, quickstart.md ✅, contracts/routes.md ✅

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US7)
- Include exact file paths in descriptions

## Implementation Strategy

**MVP First**: User Story 1 (US1) is the minimum viable product - a working Rails app serving the welcome page. Each subsequent story builds incrementally.

**Parallel Opportunities**: Tasks marked [P] can be executed in parallel within the same phase.

**Test-Driven**: Per Constitution Principle VI, every task includes unit tests, and every story includes integration tests. Full test suite must be green after each task.

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Initialize Rails 8.1.2 structure and basic configuration

- [ ] T001 Install Rails 8.1.2 gem and verify Ruby 3.4.4 compatibility
- [ ] T002 Update Gemfile with Rails 8.1.2, Puma, Propshaft, and preserve existing gems (mongo, sidekiq, bcrypt, cloudinary)
- [ ] T003 Run bundle install and resolve any gem conflicts
- [ ] T004 [P] Create Rails directory structure: config/, config/environments/, config/initializers/, app/, app/controllers/, app/channels/, app/views/, app/assets/
- [ ] T005 [P] Create config/boot.rb for Bundler setup
- [ ] T006 [P] Create config/application.rb with Rails configuration and autoload paths for repos/, infrastructure/, services/, lib/
- [ ] T007 [P] Create config/environment.rb to initialize Rails application
- [ ] T008 [P] Create config/environments/development.rb with development settings
- [ ] T009 [P] Create config/environments/test.rb with test settings  
- [ ] T010 [P] Create config/environments/production.rb with production settings
- [ ] T011 Generate SECRET_KEY_BASE for sessions (run rails secret)
- [ ] T012 Create .env file with SECRET_KEY_BASE and MONGOLAB_URI for development
- [ ] T013 Run rails about to verify Rails installation and configuration

**Checkpoint**: Rails 8.1.2 installed, directory structure created, configuration files in place

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T014 Create config/initializers/mongodb.rb to establish MongoDB connection using mongo gem
- [ ] T015 Write unit tests for MongoDB connection in spec/lib/mongodb_connection_spec.rb
- [ ] T016 Run tests and verify MongoDB connection works (test must be green)
- [ ] T017 Create config/initializers/sidekiq.rb to configure Sidekiq with Redis
- [ ] T018 [P] Create config/cable.yml for Action Cable Redis configuration
- [ ] T019 [P] Create config/puma.rb for Puma webserver configuration
- [ ] T020 Create app/controllers/application_controller.rb extending ActionController::Base
- [ ] T021 Create app/controllers/concerns/scopify.rb module (port from controllers/base.rb)
- [ ] T022 Create app/controllers/concerns/guards.rb module (port check_admin!, check_event_ownership!, check_profile_ownership!)
- [ ] T023 Create app/controllers/concerns/websocket_helpers.rb module (port send_web_socket_message - temporary, will migrate to Action Cable)
- [ ] T024 Write unit tests for Scopify concern in spec/controllers/concerns/scopify_spec.rb
- [ ] T025 Write unit tests for Guards concern in spec/controllers/concerns/guards_spec.rb
- [ ] T026 Run tests and verify all concerns work correctly (tests must be green)
- [ ] T027 Include concerns in ApplicationController and add before_action :symbolize_params
- [ ] T028 Update handling.rb to work with Rails (ensure MyExceptionHandling middleware compatible)
- [ ] T029 Configure middleware stack in config/application.rb (Rack::Deflater, MyExceptionHandling, Rack::Cors)
- [ ] T030 Create spec/rails_helper.rb for Rails-specific RSpec configuration
- [ ] T031 Configure database_cleaner for MongoDB in spec/rails_helper.rb
- [ ] T032 Update config.ru to mount Rails application instead of Sinatra
- [ ] T033 Create app/channels/application_cable/connection.rb for Action Cable authentication
- [ ] T034 Create app/channels/application_cable/channel.rb as base channel class
- [ ] T035 Write unit tests for Action Cable connection authentication in spec/channels/connection_spec.rb
- [ ] T036 Run full test suite and ensure foundational tests pass (unit tests must be green)
- [ ] T036a ⚠️ GATE CHECK: Verify all foundational tests pass (T015, T016, T024, T025, T026, T035, T036) - DO NOT proceed to Phase 3 until all green

**Checkpoint**: Foundation ready - MongoDB connected, middleware configured, base controller with concerns ready, Action Cable configured, all foundational tests green, GATE PASSED

---

## Phase 3: User Story 1 - Basic Rails Application Bootstrap (Priority: P1) 🎯 MVP

**Goal**: Initialize a Rails application that can serve the existing welcome page and handle basic routing

**Independent Test**: Start Rails server and access root URL (/) - should display welcome page with HTTP 200

### Implementation for User Story 1

- [ ] T037 [P] [US1] Create config/routes.rb with root route and health check
- [ ] T038 [P] [US1] Create app/controllers/welcome_controller.rb with index action
- [ ] T039 [P] [US1] Move views/welcome.erb to app/views/welcome/index.html.erb
- [ ] T040 [P] [US1] Move views/layout.erb to app/views/layouts/application.html.erb
- [ ] T041 [P] [US1] Update layout to use Rails asset helpers (stylesheet_link_tag, javascript_include_tag)
- [ ] T042 [US1] Write request spec for welcome page in spec/requests/welcome_spec.rb (test GET /, expect 200, expect HTML content)
- [ ] T043 [US1] Run welcome controller tests and fix any failures (test must be green)
- [ ] T044 [US1] Start Rails server (rails server) and manually verify welcome page loads at http://localhost:3000
- [ ] T045 [US1] Verify Rails logging format appears in terminal (not Sinatra format)
- [ ] T046 [US1] Run rails routes and verify root route is configured correctly
- [ ] T047 [US1] Refactor welcome controller: extract helper methods if needed, improve code readability
- [ ] T048 [US1] Run full test suite (RSpec) and verify all tests green including US1 tests

**Checkpoint**: ✅ User Story 1 Complete - Rails server runs, welcome page serves, tests pass, independently testable

---

## Phase 4: User Story 2 - User Authentication & Sessions (Priority: P2)

**Goal**: Implement login/logout functionality and session management with authentication

**Independent Test**: Register user, log in, access protected route, log out - session persists across requests

### Implementation for User Story 2

- [ ] T049 [P] [US2] Add login routes to config/routes.rb (POST /login, DELETE /login, GET /login)
- [ ] T050 [P] [US2] Add users resource routes to config/routes.rb
- [ ] T051 [P] [US2] Create app/controllers/sessions_controller.rb with create, destroy, show actions
- [ ] T052 [P] [US2] Create app/controllers/users_controller.rb with index, show, create, update, destroy, by_email, update_password actions
- [ ] T053 [US2] Port authentication logic from controllers/login.rb to sessions_controller.rb (BCrypt password validation)
- [ ] T054 [US2] Port user management logic from controllers/users.rb to users_controller.rb
- [ ] T055 [US2] Add session[:user_id] and session[:identity] assignment in sessions#create
- [ ] T056 [US2] Add session.clear in sessions#destroy (logout)
- [ ] T057 [US2] Implement current_user helper in Guards concern using session[:user_id]
- [ ] T058 [US2] Implement require_login! before_action for protected routes
- [ ] T059 [US2] Write request specs for sessions in spec/requests/sessions_spec.rb (login success, login failure, logout)
- [ ] T060 [US2] Write request specs for users in spec/requests/users_spec.rb (CRUD operations, authentication required)
- [ ] T061 [US2] Run authentication tests and fix failures (tests must be green)
- [ ] T062 [US2] Test authentication flow manually: create user via POST /users, login via POST /login, verify session cookie set
- [ ] T063 [US2] Test protected route: access /users/:id without login (expect 401), then with login (expect 200)
- [ ] T064 [US2] Test logout: POST /login, verify session, DELETE /login, verify session cleared
- [ ] T065 [US2] Refactor authentication code: extract session management into concern if needed, improve error handling
- [ ] T066 [US2] Refactor user controller: simplify actions, improve parameter handling with strong params
- [ ] T067 [US2] Run full test suite and verify all tests green including US1-US2

**Checkpoint**: ✅ User Story 2 Complete - Authentication works, sessions persist, protected routes enforced, tests pass

---

## Phase 5: User Story 3 - Event Management CRUD (Priority: P3)

**Goal**: Implement create, read, update, delete operations for events with ownership validation

**Independent Test**: Create event, view event, update event, delete event - all CRUD operations persist to MongoDB

### Implementation for User Story 3

- [ ] T068 [P] [US3] Add events resource routes to config/routes.rb with member routes (public, duplicate)
- [ ] T069 [P] [US3] Add nested programs routes under events in config/routes.rb
- [ ] T070 [P] [US3] Add nested activities routes under events in config/routes.rb
- [ ] T071 [P] [US3] Create app/controllers/events_controller.rb with standard CRUD + public, duplicate actions
- [ ] T072 [P] [US3] Create app/controllers/programs_controller.rb with index, create, update, destroy actions
- [ ] T073 [P] [US3] Create app/controllers/activities_controller.rb with index, create, update, destroy actions
- [ ] T074 [US3] Port event management logic from controllers/events.rb to events_controller.rb
- [ ] T075 [US3] Port program management logic from controllers/programs.rb to programs_controller.rb  
- [ ] T076 [US3] Port activity creation logic from infrastructure/actions/activities.rb integration
- [ ] T077 [US3] Implement check_event_ownership! guard in events controller
- [ ] T078 [US3] Add before_action :require_login for all event actions except show and public
- [ ] T079 [US3] Use Repos::Events for all database operations (preserve repository pattern)
- [ ] T080 [US3] Implement CachedEvent.delete(event_id) after event updates (preserve caching)
- [ ] T081 [US3] Write request specs for events in spec/requests/events_spec.rb (CRUD, ownership, public view)
- [ ] T082 [US3] Write request specs for programs in spec/requests/programs_spec.rb (nested CRUD)
- [ ] T083 [US3] Write request specs for activities in spec/requests/activities_spec.rb (nested CRUD)
- [ ] T084 [US3] Run event management tests and fix failures (tests must be green)
- [ ] T085 [US3] Test event CRUD manually: create event POST /events, view GET /events/:id, update PATCH /events/:id, delete DELETE /events/:id
- [ ] T086 [US3] Test ownership: create event as user1, try to update as user2 (expect 403)
- [ ] T087 [US3] Test programs: create program POST /events/:id/programs, verify nested in event
- [ ] T088 [US3] Refactor events controller: extract event finding into before_action, simplify actions
- [ ] T089 [US3] Refactor programs/activities controllers: DRY up nested resource handling
- [ ] T090 [US3] Run full test suite and verify all tests green including US1-US3

**Checkpoint**: ✅ User Story 3 Complete - Event CRUD works, ownership enforced, programs/activities nested, tests pass

---

## Phase 6: User Story 4 - Profile & Production Management (Priority: P4)

**Goal**: Implement profile and production CRUD operations with user linkage

**Independent Test**: Create profile, link productions, view profile with productions, update profile/productions

### Implementation for User Story 4

- [ ] T091 [P] [US4] Add profiles resource routes to config/routes.rb with member route (public)
- [ ] T092 [P] [US4] Add productions resource routes to config/routes.rb
- [ ] T093 [P] [US4] Add spaces resource routes to config/routes.rb
- [ ] T094 [P] [US4] Create app/controllers/profiles_controller.rb with CRUD + public action
- [ ] T095 [P] [US4] Create app/controllers/productions_controller.rb with CRUD actions
- [ ] T096 [P] [US4] Create app/controllers/spaces_controller.rb with CRUD actions
- [ ] T097 [US4] Port profile management logic from controllers/profiles.rb to profiles_controller.rb
- [ ] T098 [US4] Port production management logic from controllers/productions.rb to productions_controller.rb
- [ ] T099 [US4] Port space management logic from controllers/spaces.rb to spaces_controller.rb
- [ ] T100 [US4] Implement check_profile_ownership! guard in profiles controller
- [ ] T101 [US4] Link profiles to users (ensure profile[:user_id] set on creation)
- [ ] T102 [US4] Link productions to profiles (ensure production[:profile_id] set on creation)
- [ ] T103 [US4] Use Repos::Profiles and Repos::Productions for database operations
- [ ] T104 [US4] Write request specs for profiles in spec/requests/profiles_spec.rb (CRUD, ownership, linkage)
- [ ] T105 [US4] Write request specs for productions in spec/requests/productions_spec.rb (CRUD, profile association)
- [ ] T106 [US4] Write request specs for spaces in spec/requests/spaces_spec.rb (CRUD)
- [ ] T107 [US4] Run profile/production tests and fix failures (tests must be green)
- [ ] T108 [US4] Test profile-production linkage: create profile, add productions, GET /profiles/:id verify productions included
- [ ] T109 [US4] Test ownership: create profile as user1, try to update as user2 (expect 403)
- [ ] T110 [US4] Refactor profiles controller: simplify actions, extract common patterns
- [ ] T111 [US4] Refactor productions controller: improve association handling
- [ ] T112 [US4] Run full test suite and verify all tests green including US1-US4

**Checkpoint**: ✅ User Story 4 Complete - Profiles and productions work, associations correct, ownership enforced, tests pass

---

## Phase 7: User Story 5 - WebSocket Real-time Updates (Priority: P5)

**Goal**: Migrate WebSocket functionality from Faye::WebSocket to Rails Action Cable

**Independent Test**: Establish WebSocket connection, subscribe to channel, trigger update, verify message received <2s

### Implementation for User Story 5

- [ ] T113 [P] [US5] Add Action Cable route to config/routes.rb (mount ActionCable.server => '/cable')
- [ ] T114 [P] [US5] Create app/channels/event_channel.rb for event updates
- [ ] T115 [P] [US5] Create app/channels/program_channel.rb for program updates
- [ ] T116 [P] [US5] Create app/channels/profile_channel.rb for profile updates
- [ ] T117 [US5] Implement subscribed/unsubscribed methods in event_channel.rb (stream_from "event_#{params[:event_id]}")
- [ ] T118 [US5] Implement subscribed/unsubscribed methods in program_channel.rb
- [ ] T119 [US5] Implement subscribed/unsubscribed methods in profile_channel.rb
- [ ] T120 [US5] Add authentication check in application_cable/connection.rb (reject_unauthorized_connection if no session)
- [ ] T121 [US5] Replace Services::WsClients.send_message calls with ActionCable.server.broadcast in controllers
- [ ] T122 [US5] Update events_controller to broadcast via ActionCable.server.broadcast("event_#{id}", message)
- [ ] T123 [US5] Update programs_controller to broadcast program changes
- [ ] T124 [US5] Update profiles_controller to broadcast profile changes
- [ ] T125 [US5] Write channel specs for event_channel in spec/channels/event_channel_spec.rb (subscription, broadcasting)
- [ ] T126 [US5] Write channel specs for program_channel in spec/channels/program_channel_spec.rb
- [ ] T127 [US5] Write channel specs for profile_channel in spec/channels/profile_channel_spec.rb
- [ ] T128 [US5] Write connection spec in spec/channels/connection_spec.rb (authentication required)
- [ ] T129 [US5] Run Action Cable tests and fix failures (tests must be green)
- [ ] T130 [US5] Test WebSocket connection manually: open browser console, connect to ws://localhost:3000/cable
- [ ] T131 [US5] Test channel subscription: subscribe to event channel, update event, verify message received
- [ ] T132 [US5] Test authentication: try to connect without session (expect rejection)
- [ ] T133 [US5] Measure message delivery time (must be <2s per acceptance criteria)
- [ ] T134 [US5] Remove Faye::WebSocket middleware from config/application.rb
- [ ] T135 [US5] Remove services/websocket.rb (fully replaced by Action Cable)
- [ ] T136 [US5] Refactor channel classes: DRY up common subscription patterns
- [ ] T137 [US5] Run full test suite and verify all tests green including US1-US5

**Checkpoint**: ✅ User Story 5 Complete - Action Cable works, real-time updates functional, message delivery <2s, tests pass

---

## Phase 8: User Story 6 - Admin Panel & Meta Resource Management (Priority: P6)

**Goal**: Implement admin authentication and meta resource CRUD (tags, ambients, galleries, admins, assets, participants)

**Note**: Forms and FreeBlocks meta resources are handled separately in Phase 10 (T191-T192). This phase covers core admin panel functionality.

**Independent Test**: Login as admin, access /admin routes, CRUD meta resources, verify non-admin blocked

### Implementation for User Story 6

- [ ] T138 [P] [US6] Add admin namespace routes to config/routes.rb with resources for tags, ambients, galleries, admins, assets, participants
- [ ] T139 [P] [US6] Create app/controllers/admin/admin_controller.rb with index action (dashboard)
- [ ] T140 [P] [US6] Create app/controllers/admin/tags_controller.rb with CRUD actions
- [ ] T141 [P] [US6] Create app/controllers/admin/ambients_controller.rb with CRUD actions
- [ ] T142 [P] [US6] Create app/controllers/admin/galleries_controller.rb with CRUD actions
- [ ] T143 [P] [US6] Create app/controllers/admin/admins_controller.rb with index, create, destroy actions
- [ ] T144 [P] [US6] Create app/controllers/admin/assets_controller.rb with CRUD actions
- [ ] T145 [P] [US6] Create app/controllers/admin/participants_controller.rb with CRUD actions
- [ ] T146 [US6] Add before_action :check_admin! to Admin::AdminController (inherited by all admin controllers)
- [ ] T147 [US6] Port meta resource logic from controllers/meta_controller.rb pattern to individual admin controllers
- [ ] T148 [US6] Use MetaRepos::Tags, MetaRepos::Ambients, etc. for database operations
- [ ] T149 [US6] Write request specs for admin/tags in spec/requests/admin/tags_spec.rb (CRUD, admin required)
- [ ] T150 [US6] Write request specs for admin/ambients in spec/requests/admin/ambients_spec.rb
- [ ] T151 [US6] Write request specs for admin/galleries in spec/requests/admin/galleries_spec.rb
- [ ] T152 [US6] Write request specs for admin/admins in spec/requests/admin/admins_spec.rb (admin management)
- [ ] T153 [US6] Run admin controller tests and fix failures (tests must be green)
- [ ] T154 [US6] Test admin authentication: access /admin as non-admin (expect 403)
- [ ] T155 [US6] Test admin CRUD: create tag POST /admin/tags, update PATCH /admin/tags/:id, delete DELETE /admin/tags/:id
- [ ] T156 [US6] Test admin creation: POST /admin/admins with user email, verify user becomes admin
- [ ] T157 [US6] Refactor admin controllers: extract common patterns into Admin::BaseController concern
- [ ] T158 [US6] Run full test suite and verify all tests green including US1-US6

**Checkpoint**: ✅ User Story 6 Complete - Admin panel works, meta resources manageable, authorization enforced, tests pass

---

## Phase 9: User Story 7 - Asset Pipeline & Frontend Integration (Priority: P7)

**Goal**: Integrate Rails asset pipeline with existing React frontend and ensure all assets load correctly

**Independent Test**: Run assets:precompile, start server, load page, verify JS/CSS load without 404s, React renders

### Implementation for User Story 7

- [ ] T159 [P] [US7] Move assets/stylesheets/ to app/assets/stylesheets/
- [ ] T160 [P] [US7] Move assets/images/ to app/assets/images/
- [ ] T161 [P] [US7] Move assets/javascripts/ to app/assets/javascripts/ (legacy JS)
- [ ] T162 [P] [US7] Keep assets/reactjs/ at root (webpack builds independently)
- [ ] T163 [US7] Update app/views/layouts/application.html.erb to use stylesheet_link_tag 'application'
- [ ] T164 [US7] Update views to use image_tag for images (replace hardcoded /assets/images paths)
- [ ] T165 [US7] Update views to use asset_path helper where needed
- [ ] T166 [US7] Configure Propshaft in config/application.rb (should be default for Rails 8)
- [ ] T167 [US7] Create app/assets/config/manifest.js to declare asset load paths
- [ ] T168 [US7] Update React views to load webpack bundle from /assets/reactjs/bundle.js (static file)
- [ ] T169 [US7] Run rails assets:precompile and verify compilation succeeds
- [ ] T170 [US7] Check public/assets/ for compiled assets with fingerprints
- [ ] T171 [US7] Start Rails server and verify CSS loads correctly (no 404s in browser console)
- [ ] T172 [US7] Verify JavaScript legacy files load correctly (no 404s)
- [ ] T173 [US7] Run npm run build in assets/reactjs/ to build React bundle
- [ ] T174 [US7] Verify React application initializes (check browser console for React logs)
- [ ] T175 [US7] Test React routing: navigate to React pages, verify no JS errors
- [ ] T176 [US7] Test React API calls: verify React can call Rails API endpoints successfully
- [ ] T177 [US7] Test asset hot-reloading in development: modify CSS, verify auto-reload <3s
- [ ] T178 [US7] Configure production asset compilation in deployment script
- [ ] T179 [US7] Add cache headers for fingerprinted assets in production environment config
- [ ] T180 [US7] Run full test suite and verify all tests green including US1-US7
- [ ] T181 [US7] Refactor asset organization: remove unused assets, organize by feature

**Checkpoint**: ✅ User Story 7 Complete - All assets load correctly, React renders, no 404s, tests pass

---

## Phase 10: Remaining Controllers & Routes

**Purpose**: Migrate remaining controllers not covered in user stories P1-P7

- [ ] T182 [P] Add calls resource routes to config/routes.rb
- [ ] T183 [P] Add proposals routes to config/routes.rb (artist_proposals, space_proposals)
- [ ] T184 [P] Add forms resource routes to config/routes.rb
- [ ] T185 [P] Add free_blocks resource routes to config/routes.rb
- [ ] T186 [P] Add search routes to config/routes.rb
- [ ] T187 [P] Add participant namespace routes to config/routes.rb
- [ ] T188 [P] Create app/controllers/calls_controller.rb with CRUD actions
- [ ] T189 [P] Create app/controllers/artist_proposals_controller.rb with CRUD actions
- [ ] T190 [P] Create app/controllers/space_proposals_controller.rb with CRUD actions
- [ ] T191 [P] Create app/controllers/forms_controller.rb with CRUD actions
- [ ] T192 [P] Create app/controllers/free_blocks_controller.rb with CRUD actions
- [ ] T193 [P] Create app/controllers/search/search_controller.rb with index action
- [ ] T194 [P] Create app/controllers/search/suggest_controller.rb with index action
- [ ] T195 [P] Create app/controllers/participant/ controllers as needed
- [ ] T196 Port calls management logic from controllers/calls.rb
- [ ] T197 Port proposals logic from controllers/artistproposals.rb and controllers/spaceproposals.rb
- [ ] T198 Port forms logic from controllers/forms.rb
- [ ] T199 Port free blocks logic from controllers/free_blocks.rb
- [ ] T200 Port search logic from controllers/search.rb and controllers/search_suggest.rb
- [ ] T201 Port participant logic from controllers/participants.rb
- [ ] T202 Write request specs for calls in spec/requests/calls_spec.rb
- [ ] T203 Write request specs for proposals in spec/requests/proposals_spec.rb
- [ ] T204 Write request specs for forms in spec/requests/forms_spec.rb
- [ ] T205 Write request specs for free_blocks in spec/requests/free_blocks_spec.rb
- [ ] T206 Write request specs for search in spec/requests/search_spec.rb
- [ ] T207 Run remaining controller tests and fix failures (tests must be green)
- [ ] T208 Refactor remaining controllers: extract common patterns, improve consistency
- [ ] T209 Run full test suite and verify all controllers tested and passing
- [ ] T209a [P] Create app/mailers/application_mailer.rb and migrate Pony email logic to ActionMailer
- [ ] T209b Write mailer specs in spec/mailers/ for all email functionality (welcome emails, notifications, etc.)
- [ ] T209c Test email delivery in development: verify ActionMailer sends emails correctly

**Checkpoint**: All controllers migrated, all routes functional, email functionality migrated to ActionMailer, all tests green

---

## Phase 11: Test Suite Migration & Validation

**Purpose**: Ensure 95%+ test passage rate per success criteria

- [ ] T210 Run existing RSpec test suite from Sinatra codebase
- [ ] T211 Identify failures related to Sinatra-specific code (skip or adapt)
- [ ] T212 Migrate controller specs → request specs for all controllers
- [ ] T213 Update test expectations for Rails response format differences
- [ ] T214 Update test factories/fixtures if using FactoryBot or fixtures
- [ ] T215 Add channel specs for all Action Cable channels
- [ ] T216 Run full RSpec suite and document passage rate (target 95%+)
- [ ] T217 Fix critical test failures blocking 95% target
- [ ] T218 Update Cypress tests if base URL changed (should still be localhost:3000)
- [ ] T219 Run Cypress E2E tests against Rails application
- [ ] T220 Fix Cypress failures related to WebSocket URL change (/websocket → /cable)
- [ ] T221 Document any intentional test removals or skips with justification
- [ ] T222 Achieve 95%+ test passage rate across RSpec + Cypress
- [ ] T223 Verify full test suite completes in <10 minutes per success criteria

**Checkpoint**: 95%+ tests passing, test suite green, E2E tests functional

---

## Phase 12: JavaScript Client Updates

**Purpose**: Update React client to use Action Cable instead of Faye::WebSocket

- [x] T224 Add @rails/actioncable npm package to assets/reactjs/package.json
- [x] T225 Run npm install in assets/reactjs/
- [x] T226 Create assets/reactjs/src/cable.js to configure Action Cable consumer
- [x] T227 Update React WebSocket connection code to use Action Cable consumer
- [x] T228 Replace WebSocket URL from ws://localhost:3000/websocket to ws://localhost:3000/cable
- [x] T229 Update channel subscription code to use Action Cable channels API
- [x] T230 Update message handling to work with Action Cable format
- [x] T231 Test WebSocket connection from React: verify connection establishes
- [x] T232 Test channel subscription from React: subscribe to event channel, verify subscription confirmed
- [x] T233 Test message reception from React: trigger server update, verify React receives message
- [x] T234 Build React bundle: npm run build
- [x] T235 Test full flow: React loads, connects to Action Cable, receives real-time updates
- [x] T236 Refactor React WebSocket code: extract Action Cable logic into reusable service

**Checkpoint**: ✅ React client updated, Action Cable connection working, real-time updates functional

---

## Phase 13: Deployment Preparation

**Purpose**: Prepare for production deployment with big-bang strategy

- [ ] T237 Update Procfile to use Puma: `web: bundle exec puma -C config/puma.rb`
- [ ] T238 Verify Procfile worker command still works: `worker: bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb`
- [ ] T239 Update .env.production with production SECRET_KEY_BASE (new key, forces re-auth)
- [ ] T240 Configure production environment for Heroku or deployment platform
- [ ] T241 Set RAILS_ENV=production and other production environment variables
- [ ] T242 Precompile assets for production: RAILS_ENV=production rails assets:precompile
- [ ] T243 Build React production bundle: cd assets/reactjs && npm run build
- [ ] T244 Test production build locally: RAILS_ENV=production rails server
- [ ] T245 Verify all assets load in production mode (check fingerprinted filenames)
- [ ] T246 Test production database connection (MONGOLAB_URI environment variable)
- [ ] T247 Test Redis connection for Action Cable and Sidekiq in production config
- [ ] T248 Create deployment checklist: pre-deployment steps, deployment steps, rollback steps
- [ ] T249 Document rollback procedure: git revert, redeploy Sinatra, restore old SECRET_KEY_BASE
- [ ] T250 Create user communication plan: notify users of forced re-authentication
- [ ] T251 Test full deployment in staging environment if available

**Checkpoint**: Production build ready, deployment scripts prepared, rollback plan documented

---

## Phase 14: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and production readiness

- [ ] T252 Run rails routes and compare with contracts/routes.md - verify all routes match
- [ ] T253 Remove all Sinatra dependencies from Gemfile (sinatra, sinatra-contrib, sprockets-helpers)
- [ ] T254 Remove Sinatra-specific files: config/config.yml, config/gems.rb if unused
- [ ] T255 Remove old Sinatra controllers directory after verifying all migrated
- [ ] T256 Update README.md with Rails 8.1.2 setup instructions (reference quickstart.md)
- [ ] T257 Document environment variable changes: SECRET_KEY_BASE, REDIS_URL, etc.
- [ ] T258 Create MIGRATION.md documenting breaking changes (WebSocket URL, forced re-auth)
- [ ] T259 Update .gitignore for Rails artifacts (tmp/, log/, storage/, public/assets/)
- [ ] T260 Run rails stats to verify codebase statistics
- [ ] T261 Run rubocop or Rails linter to ensure code quality
- [ ] T262 Fix any linting issues or document exceptions
- [ ] T263 Run rails best_practices or similar tool to identify improvements
- [ ] T264 Refactor global: review all controllers for consistency, extract common patterns
- [ ] T265 Refactor global: review all concerns for DRY violations
- [ ] T266 Refactor global: improve error handling across all controllers
- [ ] T267 Run full test suite one final time (RSpec + Cypress) - all green
- [ ] T268 Verify all success criteria from spec.md are met
- [ ] T269 Generate migration report: test passage rate, performance comparison, breaking changes
- [ ] T270 Create post-deployment monitoring plan: error tracking, performance monitoring
- [ ] T270a Validate performance success criteria: 100+ concurrent requests (load test), <60s asset compilation (time rails assets:precompile), <2s WebSocket delivery (measure in T133), <3s hot-reload (measure in T177)
- [ ] T271 Validate all spec.md assumptions: env vars compatible with Rails, Ruby 3.4.4 works with Rails 8.1.2, no MongoDB schema changes needed, third-party APIs framework-agnostic

**Checkpoint**: All cleanup complete, documentation updated, all success criteria validated, ready for production deployment

---

## Summary

### Task Count by Phase
- Phase 1 (Setup): 13 tasks
- Phase 2 (Foundational): 24 tasks (includes T036a gate check)
- Phase 3 (US1 - Rails Bootstrap): 12 tasks
- Phase 4 (US2 - Authentication): 19 tasks
- Phase 5 (US3 - Events CRUD): 23 tasks
- Phase 6 (US4 - Profiles): 22 tasks
- Phase 7 (US5 - WebSocket): 25 tasks
- Phase 8 (US6 - Admin): 21 tasks
- Phase 9 (US7 - Assets): 23 tasks
- Phase 10 (Remaining Controllers): 31 tasks (includes T209a-T209c email migration)
- Phase 11 (Test Migration): 14 tasks
- Phase 12 (React Client): 13 tasks
- Phase 13 (Deployment): 15 tasks
- Phase 14 (Polish): 21 tasks (includes T270a, T271 validation tasks)

**Total Tasks**: 276

### Parallel Opportunities
Tasks marked [P] can be executed in parallel within their phase:
- Phase 1: T004-T010 (7 parallel config files)
- Phase 2: T018-T019 (2 parallel initializers)
- Phase 2: T021-T023 (3 parallel concerns)
- Phase 3: T037-T041 (5 parallel welcome page files)
- Phase 4: T049-T052 (4 parallel controllers)
- Phase 5: T113-T116 (4 parallel channels)
- Phase 6: T138-T145 (8 parallel admin controllers)
- Phase 9: T159-T162 (4 parallel asset moves)
- Phase 10: T182-T195 (14 parallel remaining controllers)

**Estimated Parallelization Savings**: ~40-50 tasks can run simultaneously

### Dependency Graph (User Story Completion Order)

```
Setup (Phase 1) → Foundational (Phase 2) → US1 (Phase 3)
                                              ↓
                                            US2 (Phase 4)
                                              ↓
                                            US3 (Phase 5)
                                              ↓
                  ┌───────────────────────────┼───────────────────────────┐
                  ↓                           ↓                           ↓
                US4 (Phase 6)              US5 (Phase 7)              US6 (Phase 8)
                  ↓                           ↓                           ↓
                  └───────────────────────────┼───────────────────────────┘
                                              ↓
                                            US7 (Phase 9)
                                              ↓
                              Remaining (Phase 10-11) → React Client (Phase 12)
                                              ↓
                                        Deployment (Phase 13) → Polish (Phase 14)
```

### Independent Test Criteria (Per User Story)

- **US1**: Start server, access /, expect HTTP 200 and welcome page render
- **US2**: Register user, login, access protected route, logout - session persists
- **US3**: Create/read/update/delete event, verify MongoDB persistence and ownership
- **US4**: Create profile, link productions, view profile with nested data
- **US5**: Connect WebSocket, subscribe to channel, trigger update, verify message <2s
- **US6**: Login as admin, CRUD meta resources, verify non-admin blocked
- **US7**: Precompile assets, load page, verify no 404s, React renders

### MVP Scope Recommendation
Implement **Phase 1-3 (US1 only)** first for minimal viable Rails application. This gives you a working Rails server serving the welcome page with all configuration in place. Then iterate through US2-US7 incrementally.

---

## Implementation Notes

### Testing Requirements (Constitution Principle VI)
- **After each task**: Run relevant unit tests, refactor code, ensure tests green
- **After each story**: Run full test suite (unit + integration), refactor story code as whole
- **Before moving to next phase**: Full test suite must be green (RSpec + Cypress)

### Clean Code Requirements
- Use descriptive variable/method names
- Keep controller actions small (<10 lines)
- Extract complex logic into service objects or concerns
- Follow Rails conventions (RESTful routes, strong parameters)
- Add comments for non-obvious business logic
- Consistent code formatting (use rubocop or Rails linter)

### Refactoring Checkpoints
- After T048 (US1): Refactor welcome controller
- After T067 (US2): Refactor authentication and user management
- After T090 (US3): Refactor event/program/activity controllers
- After T112 (US4): Refactor profile/production controllers
- After T137 (US5): Refactor channel classes
- After T158 (US6): Refactor admin controllers
- After T181 (US7): Refactor asset organization
- After T208 (Phase 10): Refactor remaining controllers
- After T264-T266 (Phase 14): Global refactoring pass

### Success Criteria Validation
Before marking feature complete, verify:
- ✅ Application starts on Rails 8.1.2 without Sinatra
- ✅ 95%+ RSpec tests passing
- ✅ All API endpoints return identical JSON to Sinatra
- ✅ WebSocket messages deliver in <2s
- ✅ Asset compilation completes in <60s
- ✅ Application handles 100+ concurrent requests
- ✅ MongoDB queries execute without errors
- ✅ Session auth works across protected routes
- ✅ Zero data loss (all MongoDB collections intact)
- ✅ Dev server hot-reloads in <3s
- ✅ Production deployment succeeds on Heroku
- ✅ Full test suite completes in <10 minutes
