# Feature Specification: Rails Migration

**Feature Branch**: `001-rails-migration`  
**Created**: 2026-01-30  
**Status**: Draft  
**Input**: User description: "Migrate application from Sinatra Framework to latest Rails version"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - Basic Rails Application Bootstrap (Priority: P1)

As a developer, I need to initialize a Rails application structure that can serve the existing welcome page and handle basic routing, so that we have a minimal working Rails application to build upon.

**Why this priority**: This is the foundation - without a working Rails app, no other migration work can proceed. It proves the Rails framework is properly configured and can serve requests.

**Independent Test**: Can be fully tested by starting the Rails server and accessing the root URL (/) - should display the welcome page without errors. The test passes when: (1) Rails server starts successfully, (2) Root route responds with HTTP 200, (3) Welcome page renders.

**Acceptance Scenarios**:

1. **Given** a fresh Rails 8.x application structure, **When** I run `rails server`, **Then** the server starts without errors on port 3000
2. **Given** the Rails server is running, **When** I visit the root URL (/), **Then** I see the welcome page with HTTP 200 status
3. **Given** the application is running, **When** I check the logs, **Then** I see Rails standard logging format (not Sinatra format)
4. **Given** the Rails app is configured, **When** I check the database configuration, **Then** MongoDB connection is properly configured

---

### User Story 2 - User Authentication & Sessions (Priority: P2)

As an end user, I need to be able to log in and maintain my session across requests, so that I can access protected features and my personal data.

**Why this priority**: Authentication is core to the application - most features require user identity. Once P1 proves Rails works, authentication unlocks access to user-specific functionality.

**Independent Test**: Can be fully tested by: (1) Registering a new user via /users endpoint, (2) Logging in via /login, (3) Accessing a protected endpoint with the session, (4) Logging out. Test passes when session persists across requests and protected routes require authentication.

**Acceptance Scenarios**:

1. **Given** I have valid credentials, **When** I POST to /login with email and password, **Then** I receive a successful response and a session cookie
2. **Given** I am logged in, **When** I access a protected route, **Then** I can view the resource without being redirected to login
3. **Given** I am not logged in, **When** I try to access a protected route, **Then** I am redirected to the login page or receive 401 Unauthorized
4. **Given** I am logged in, **When** I make a request to /logout, **Then** my session is destroyed and subsequent requests are unauthenticated
5. **Given** I have an active session, **When** I close my browser and return (within session timeout), **Then** I am still logged in

---

### User Story 3 - Event Management CRUD (Priority: P3)

As an event organizer, I need to create, view, update, and delete events through the web interface, so that I can manage my event listings.

**Why this priority**: Events are central business objects in Orfheo. With Rails working (P1) and auth in place (P2), event CRUD demonstrates Rails can handle complex business logic and data persistence.

**Independent Test**: Can be fully tested by: (1) Creating a new event via POST /events, (2) Viewing the event via GET /events/:id, (3) Updating the event via PUT/PATCH /events/:id, (4) Deleting the event via DELETE /events/:id. Test passes when all CRUD operations persist to MongoDB and return appropriate responses.

**Acceptance Scenarios**:

1. **Given** I am an authenticated event owner, **When** I POST event data to /events, **Then** a new event is created in MongoDB and I receive the event ID
2. **Given** an event exists, **When** I GET /events/:id, **Then** I receive the complete event details in JSON format
3. **Given** I own an event, **When** I PATCH /events/:id with updated data, **Then** the event is updated in MongoDB and I receive confirmation
4. **Given** I own an event, **When** I DELETE /events/:id, **Then** the event is removed from MongoDB and returns 204 No Content
5. **Given** I don't own an event, **When** I try to update or delete it, **Then** I receive 403 Forbidden

---

### User Story 4 - Profile & Production Management (Priority: P4)

As a user, I need to manage my artist profile and production listings, so that I can showcase my work and offerings to event organizers.

**Why this priority**: Profiles and productions are key to the platform but depend on users (P2) and follow similar patterns to events (P3). Can be implemented after core patterns are established.

**Independent Test**: Can be fully tested by: (1) Creating a profile via POST /profiles, (2) Linking productions to the profile via POST /productions, (3) Viewing profile with nested productions via GET /profiles/:id, (4) Updating profile/productions. Test passes when profile-production relationships work correctly.

**Acceptance Scenarios**:

1. **Given** I am authenticated, **When** I POST my profile data to /profiles, **Then** a new profile is created and linked to my user account
2. **Given** I have a profile, **When** I POST production data to /productions, **Then** the production is created and associated with my profile
3. **Given** I have a profile with productions, **When** I GET /profiles/:id, **Then** I receive my profile data including all associated productions
4. **Given** I own a profile, **When** I PATCH /profiles/:id, **Then** my profile information is updated
5. **Given** I own a production, **When** I DELETE /productions/:id, **Then** the production is removed but my profile remains intact

---

### User Story 5 - WebSocket Real-time Updates (Priority: P5)

As a user collaborating with others, I need to receive real-time updates when data changes, so that I always see the current state without manual refreshing.

**Why this priority**: Real-time features enhance UX but aren't blocking - the app works fine with manual refresh. Can be added after core CRUD operations are stable.

**Independent Test**: Can be fully tested by: (1) Establishing a WebSocket connection via /websocket, (2) Subscribing to a channel, (3) Triggering an update from another session, (4) Verifying the WebSocket client receives the update. Test passes when updates propagate in under 2 seconds.

**Acceptance Scenarios**:

1. **Given** I have an active Rails Action Cable connection, **When** another user updates an event I'm viewing, **Then** I receive a WebSocket message with the updated data within 2 seconds
2. **Given** I am subscribed to an event channel, **When** the event is deleted, **Then** I receive a deletion notification via WebSocket
3. **Given** my WebSocket connection drops, **When** the connection is re-established, **Then** I automatically resubscribe to my channels
4. **Given** I am not authenticated, **When** I try to establish a WebSocket connection to protected channels, **Then** the connection is rejected

---

### User Story 6 - Admin Panel & Meta Resource Management (Priority: P6)

As a platform administrator, I need to manage system-wide resources (tags, ambients, galleries, admins) through the admin panel, so that I can configure the platform and moderate content.

**Why this priority**: Admin features are important for operations but don't block end-user functionality. Can be implemented last since they follow established CRUD patterns.

**Independent Test**: Can be fully tested by: (1) Logging in as an admin user, (2) Accessing /admin routes, (3) Creating/updating/deleting meta resources (tags, admins, etc.), (4) Verifying non-admin users are blocked from admin routes. Test passes when admin CRUD works and authorization is enforced.

**Acceptance Scenarios**:

1. **Given** I am an authenticated admin, **When** I GET /admin, **Then** I see the admin dashboard with links to meta resource management
2. **Given** I am an admin, **When** I POST to /admin/tags, **Then** a new tag is created and available system-wide
3. **Given** I am an admin, **When** I POST to /admin/admins with a user email, **Then** that user receives admin privileges
4. **Given** I am not an admin, **When** I try to access /admin routes, **Then** I receive 403 Forbidden
5. **Given** I am an admin, **When** I DELETE /admin/tags/:id, **Then** the tag is removed from the system

---

### User Story 7 - Asset Pipeline & Frontend Integration (Priority: P7)

As a frontend developer, I need the JavaScript and CSS assets to be properly compiled and served by Rails, so that the React frontend functions correctly with the new backend.

**Why this priority**: Frontend integration is critical for user experience, but it can be worked on in parallel with backend features once P1 is complete. The existing React app can be served by the old Sinatra app during migration.

**Independent Test**: Can be fully tested by: (1) Running `rails assets:precompile`, (2) Starting the Rails server, (3) Accessing the root URL and checking browser DevTools for: (a) JavaScript files load without 404s, (b) CSS files load without 404s, (c) React app initializes without console errors. Test passes when all assets load and React renders.

**Acceptance Scenarios**:

1. **Given** assets are configured in Rails, **When** I run `rails assets:precompile`, **Then** all JavaScript and CSS files are compiled to public/assets without errors
2. **Given** the Rails server is running in development, **When** I modify a JavaScript file, **Then** the asset is automatically recompiled on the next request
3. **Given** I access a page requiring JavaScript, **When** the page loads, **Then** all script tags resolve with HTTP 200 and execute without errors
4. **Given** the React application initializes, **When** I check the browser console, **Then** there are no JavaScript errors related to asset loading
5. **Given** assets are precompiled for production, **When** I deploy to production, **Then** assets are served with fingerprinted filenames and proper cache headers

---

### Edge Cases

- What happens when a controller action that exists in Sinatra has no direct Rails equivalent (e.g., custom Rack middleware)?
  - **Resolution**: Map Rack middleware to Rails middleware stack in `config/application.rb`
- What happens when MongoDB queries use Sinatra-specific helpers or patterns?
  - **Resolution**: Extract queries into repository classes (already exists in `repos/`) - should work as-is
- What happens when WebSocket connections are established during the migration cutover?
  - **Resolution**: Implement graceful degradation - fall back to polling if WebSocket fails
- What happens when the session format differs between Sinatra and Rails?
  - **Resolution**: Clear all sessions at cutover; users must re-authenticate once after migration
- What happens when background jobs (Sidekiq) are running during deployment?
  - **Resolution**: Ensure worker code is compatible with both frameworks during transition, or drain workers before cutover
- What happens when routes have different naming conventions between Sinatra and Rails?
  - **Resolution**: Use Rails routing constraints and custom route names to maintain backward compatibility with existing API clients
- What happens when the asset pipeline changes how assets are referenced in views?
  - **Resolution**: Update all asset references to use Rails helpers (`javascript_include_tag`, `stylesheet_link_tag`, `asset_path`)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST run on Rails 8.x (latest stable version as of 2026-01-30)
- **FR-002**: System MUST maintain MongoDB as the persistence layer using the `mongo` gem (currently v2.8+)
- **FR-003**: System MUST preserve all existing API endpoints with identical request/response formats for backward compatibility
- **FR-004**: System MUST maintain existing authentication and session management behavior (BCrypt password hashing, session-based auth)
- **FR-005**: System MUST support WebSocket connections for real-time updates using Rails Action Cable (replacing Faye::WebSocket)
- **FR-006**: System MUST preserve all existing controller actions from Sinatra (20+ controllers including Users, Events, Profiles, Programs, etc.)
- **FR-007**: System MUST integrate the existing React frontend without requiring React code changes
- **FR-008**: System MUST serve assets (JavaScript, CSS, images) through the Rails asset pipeline
- **FR-009**: System MUST maintain Sidekiq integration for background job processing
- **FR-010**: System MUST preserve the repository pattern for MongoDB access (existing `Repos::*` classes in `repos/` directory)
- **FR-011**: System MUST maintain exception handling behavior with consistent JSON error responses (Pard::Invalid, Pard::Unexisting)
- **FR-012**: System MUST support the existing meta repositories system (tags, ambients, galleries, admins, assets, participants)
- **FR-013**: System MUST maintain the existing email sending functionality via Pony gem or Rails ActionMailer
- **FR-014**: System MUST preserve Cloudinary integration for image/asset management
- **FR-015**: System MUST run in development, test, and production environments with appropriate configurations
- **FR-016**: System MUST maintain the existing test suite (RSpec + Cypress) with minimal modifications
- **FR-017**: System MUST support the existing Rack middleware stack (Deflater, custom exception handling, CORS)
- **FR-018**: System MUST maintain routing structure: separate route namespaces for `/`, `/login`, `/search`, `/forms`, `/admin`, `/participant`, `/assets`
- **FR-019**: System MUST preserve the `scopify` helper pattern for defining controller-level param accessors
- **FR-020**: System MUST maintain ownership/admin guard methods (`check_event_ownership!`, `check_profile_ownership!`, `check_admin!`)

### Key Entities *(include if feature involves data)*

The Rails migration does not introduce new entities but must support the existing data model:

- **User**: Authentication credentials, profile references, session management
- **Profile**: Artist/organization profiles linked to users
- **Event**: Event listings with ownership, program associations, and metadata
- **Program**: Event programs containing structured activities
- **Activity**: Individual activities within programs
- **Production**: Artistic productions linked to profiles
- **Space**: Venue/space information for events
- **Call**: Open calls for artists/spaces with proposals
- **Proposal**: Artist/space proposals in response to calls (ArtistProposal, SpaceProposal)
- **FreeBlock**: Custom content blocks for events
- **Form**: Custom form definitions
- **Meta Resources**: System-wide resources (Tags, Ambients, Galleries, Admins, Assets, Participants)

### Success Criteria *(mandatory)*

- Application starts successfully on Rails 8.x without Sinatra dependencies
- All existing RSpec tests pass with Rails-specific adaptations (target: 95%+ of current tests passing)
- All existing API endpoints respond with identical JSON structures as before migration
- WebSocket connections establish and deliver messages within 2 seconds
- Asset compilation completes without errors in under 60 seconds
- Application handles 100+ concurrent requests without degradation
- MongoDB queries execute without errors
- Session-based authentication works across all protected routes
- Zero data loss during migration (all MongoDB collections remain intact and accessible)
- Development server hot-reloads code changes within 3 seconds
- Production deployment completes successfully on existing infrastructure (Heroku-compatible)
- Full test suite (RSpec + Cypress) completes in under 10 minutes

### Non-Functional Requirements

- **Performance**: Response times should remain comparable to current Sinatra baseline; no formal baseline measurement or validation required
- **Compatibility**: Must support Ruby 3.4.4 (current version in Gemfile)
- **Deployment**: Big-bang deployment with single cutover; must be deployable to Heroku or similar Rack-compatible platforms with immediate Rails-only operation
- **Monitoring**: Must use Rails structured logging with request tracking and log levels; support existing log aggregation integrations
- **Documentation**: Migration guide must document all breaking changes and upgrade steps
- **Rollback**: Must support rollback to Sinatra if critical issues arise post-deployment (via git revert and redeploy)

### Assumptions

- MongoDB version and configuration remain unchanged; no schema migration or document restructuring required
- React frontend uses standard asset references (no custom Sinatra-specific paths)
- Background jobs (Sidekiq) can continue running during migration with compatible code
- Third-party integrations (Cloudinary, email service) have framework-agnostic APIs
- Test database (`cg_test`) can be safely recreated or migrated
- Existing environment variables (`.env`, `.env.production`) are compatible with Rails conventions
- Current Ruby version (3.4.4) is compatible with Rails 8.x
- All user sessions will be cleared at cutover; users must re-authenticate post-migration

### Out of Scope

- Redesigning the application architecture or data model
- Refactoring existing business logic in Actions or Services
- Upgrading the React frontend or changing its build process
- Migrating from MongoDB to a different database
- Changing the deployment platform or infrastructure
- Implementing new features beyond the migration itself
- Redesigning the API contract or response formats
- Upgrading or replacing Sidekiq for background jobs

## Clarifications

### Session 2026-01-30

- Q: What deployment strategy should be used during the Rails migration? → A: Big-bang deployment (single cutover, immediate Rails-only)
- Q: Do existing MongoDB documents need schema validation or migration scripts during the Rails transition? → A: No schema migration needed
- Q: What observability strategy should be used for the Rails migration? → A: Use Rails structured logging with request tracking and log levels
- Q: How should user sessions be handled during the migration? → A: Force re-authentication after cutover (clear all sessions)
- Q: How should baseline performance be measured and validated? → A: Skip performance validation
