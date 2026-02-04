# Implementation Plan: Rails Migration

**Branch**: `001-rails-migration` | **Date**: 2026-01-30 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-rails-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate the Orfheo cultural event management application from Sinatra to Rails 8.1.2 while preserving all existing functionality, API contracts, and data integrity. The migration follows a big-bang deployment strategy with forced user re-authentication at cutover. The Rails application will use Puma as the webserver, MongoDB for persistence (via existing repository pattern), Rails Action Cable for WebSocket support, and maintain backward compatibility with the existing React frontend and all third-party integrations (Cloudinary, Sidekiq, etc.).

## Technical Context

**Language/Version**: Ruby 3.4.4 (current production version per Gemfile)  
**Primary Dependencies**: Rails 8.1.2, Puma (webserver), Mongo gem 2.8+, Sidekiq (background jobs), BCrypt (authentication), Faye-WebSocket → Rails Action Cable (WebSocket migration), Cloudinary (asset management), Pony/ActionMailer (email)  
**Storage**: MongoDB (existing collections unchanged, no schema migration required)  
**Testing**: RSpec (backend unit/integration tests), Cypress (end-to-end frontend tests), Rack::Test (request specs)  
**Target Platform**: Heroku-compatible PaaS (Rack-based deployment), Linux server environment  
**Project Type**: Web application (Rack-based, single repository with backend controllers + frontend React assets)  
**Performance Goals**: Maintain current throughput (100+ concurrent requests), asset compilation <60s, WebSocket message delivery <2s, dev server hot-reload <3s  
**Constraints**: Zero data loss during migration, 95%+ test passage rate, backward-compatible API responses (identical JSON structures), big-bang deployment (single cutover), forced session clearing (all users re-authenticate)  
**Scale/Scope**: 20+ controllers, 12+ entity types, 7 route namespaces, existing React frontend (no code changes), MongoDB persistence layer with repository pattern, WebSocket real-time updates

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Clarity Over Assumptions ✅ PASS
- **Status**: All unknowns resolved via clarification session (2026-01-30)
- **Evidence**: 5 clarifications documented in spec.md (deployment strategy, schema migration, observability, session handling, performance validation)
- **File Paths**: All concrete and repository-relative (specs/001-rails-migration/*, config/*, app/*, etc.)
- **No NEEDS CLARIFICATION markers remain**: Confirmed

### Principle II: User-Story-Driven Delivery ✅ PASS
- **Status**: 7 prioritized user stories (P1-P7) defined with independent test criteria
- **Evidence**: Each story has "Independent Test" section and "Why this priority" justification
- **MVP Slices**: P1 (Rails bootstrap) is independently deployable; subsequent stories build incrementally
- **Acceptance Scenarios**: 35 total Given/When/Then scenarios across all stories

### Principle III: Gate-Driven Planning ✅ PASS
- **Status**: This Constitution Check is present and being executed before Phase 0
- **Gate Treatment**: No violations identified; all principles satisfied
- **Justifications**: None required (no complexity/violations)
- **Re-check**: Will re-validate after Phase 1 design artifacts generated

### Principle IV: Reproducible, Scriptable Workflow ✅ PASS
- **Status**: Using `.specify/scripts/bash/setup-plan.sh` for artifact generation
- **Templates**: Following `.specify/templates/plan-template.md` structure
- **Automation**: This plan generated via `/speckit.plan` command
- **Manual Additions**: Will preserve in designated blocks (none yet in this plan)

### Principle V: Evidence Over Ceremony ✅ PASS
- **Status**: Clarifications include rationale (5 Q&A pairs with context)
- **Tests**: Optional per spec; no tests explicitly requested beyond existing RSpec/Cypress suites
- **Actionability**: Plan output immediately usable for research phase (all unknowns resolved)
- **Decisions**: Deployment (big-bang), sessions (force re-auth), logging (Rails structured) all documented with reasoning

### Principle VI: Testing, Refactoring, Clean Code ⚠️ ATTENTION REQUIRED
- **Status**: PENDING - Implementation phase requirement
- **Unit Tests**: Will be required for each new Rails integration (controllers, middleware, Action Cable channels)
- **Integration Tests**: Required for each user story (7 stories = minimum 7 integration test suites)
- **End-to-End Tests**: Existing Cypress suite must pass with 95%+ rate post-migration
- **Refactoring**: Required after each task and after each story completion
- **Test Suite**: Must remain green throughout implementation
- **Clean Code**: All migrated code must follow Rails conventions and Clean Code principles

**Overall Gate Status**: ✅ **PASS** - Proceed to Phase 0 Research

**Notes**: 
- All pre-research gates satisfied (Principles I-V)
- Principle VI gates will be enforced during implementation phase
- No complexity violations requiring justification
- Re-check scheduled after Phase 1 design artifacts generated

## Project Structure

### Documentation (this feature)

```text
specs/001-rails-migration/
├── spec.md              # Feature specification with 7 user stories
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (Rails 8.1.2 best practices, migration patterns)
├── quickstart.md        # Phase 1 output (Rails setup, running migration)
├── contracts/           # Phase 1 output (route mappings: Sinatra → Rails)
└── checklists/
    └── requirements.md  # Specification quality validation (PASSED)
```

### Source Code (repository root)

**Current Sinatra Structure** (to be migrated):
```text
orfheo/ (current)
├── config.ru                      # Rack entrypoint (Sinatra controllers mounted)
├── Gemfile                        # Sinatra 4.1, Ruby 3.4.4
├── controllers/                   # 20+ Sinatra controllers
│   ├── base.rb                   # BaseController < Sinatra::Base
│   ├── users.rb, events.rb, profiles.rb, etc.
│   └── meta_controller.rb        # Dynamic meta resource controllers
├── repos/                         # MongoDB repository pattern (preserve as-is)
│   ├── repos_factory.rb          # Dynamic Repos::* class generation
│   ├── users.rb, events.rb, etc.
│   └── meta_repos/               # Meta resources (tags, admins, etc.)
├── infrastructure/actions/        # Business logic (preserve as-is)
├── services/                      # Domain services (websocket.rb, mailing, etc.)
├── lib/                          # Utilities, cache, storage
├── workers/                       # Sidekiq/Sucker Punch workers
├── views/                         # ERB templates
├── assets/                        # JavaScript, CSS, images
│   ├── javascripts/              # Legacy JS + ES6
│   └── reactjs/                  # React frontend (package.json, webpack)
├── spec/                          # RSpec tests
└── cypress/                       # E2E tests
```

**Target Rails Structure** (post-migration):
```text
orfheo/ (Rails 8.1.2)
├── config.ru                      # Rack entrypoint (Rails::Application)
├── Gemfile                        # Rails 8.1.2, Ruby 3.4.4, Puma
├── config/
│   ├── application.rb            # Rails app config, middleware stack
│   ├── routes.rb                 # Route mappings (7 namespaces preserved)
│   ├── environments/             # development.rb, test.rb, production.rb
│   ├── initializers/             # MongoDB, Sidekiq, Cloudinary, session config
│   └── mongoid.yml (or similar)  # MongoDB connection config
├── app/
│   ├── controllers/              # Rails controllers (migrated from Sinatra)
│   │   ├── application_controller.rb  # Base (was BaseController)
│   │   ├── users_controller.rb
│   │   ├── events_controller.rb
│   │   ├── profiles_controller.rb
│   │   ├── meta_controller.rb    # Preserve dynamic meta pattern
│   │   └── [20+ other controllers]
│   ├── channels/                 # Rails Action Cable channels (WebSocket)
│   │   ├── application_cable/
│   │   └── event_channel.rb, etc.
│   ├── helpers/                  # View helpers (scopify, guard methods, etc.)
│   ├── mailers/                  # ActionMailer (replace Pony)
│   ├── views/                    # ERB templates (migrated from root /views)
│   └── assets/                   # Rails asset pipeline
│       ├── config/manifest.js
│       ├── javascripts/          # Migrated JS from /assets/javascripts
│       └── stylesheets/
├── repos/                         # MongoDB repository pattern (UNCHANGED)
│   ├── repos_factory.rb          # Preserved as-is
│   ├── users.rb, events.rb, etc.
│   └── meta_repos/
├── infrastructure/                # Business logic actions (UNCHANGED)
├── services/                      # Domain services (MOSTLY UNCHANGED)
│   ├── websocket.rb → channels/ # Migrate to Action Cable
│   └── [other services preserved]
├── lib/                          # Utilities (UNCHANGED)
├── workers/                       # Sidekiq workers (UNCHANGED)
├── public/                        # Static assets, compiled assets
├── spec/                          # RSpec tests (adapted for Rails)
│   ├── rails_helper.rb          # Rails test config
│   ├── controllers/             # Request specs
│   ├── channels/                # Action Cable channel specs
│   └── [existing test structure]
├── cypress/                       # E2E tests (minimal changes)
└── node_modules/                  # React build dependencies (unchanged)
```

**Structure Decision**: 

This is a **web application migration** from Sinatra (Rack-based) to Rails (also Rack-based). The key structural changes are:

1. **Controllers**: Move from `/controllers` (Sinatra::Base subclasses) to `/app/controllers` (ActionController::Base subclasses)
2. **Views**: Move from `/views` to `/app/views` 
3. **Assets**: Move from `/assets` to `/app/assets` with Rails asset pipeline integration
4. **WebSocket**: Migrate from `services/websocket.rb` (Faye::WebSocket) to `/app/channels` (Action Cable)
5. **Configuration**: Add `/config/` directory with Rails conventions (routes, initializers, environments)
6. **Preserve**: `/repos`, `/infrastructure`, `/lib`, `/workers`, `/services` (minus websocket), `/spec`, `/cypress` remain at root and largely unchanged

The repository maintains a **single-project structure** at the root (not a monorepo), following Rails conventions while preserving existing domain layer (`repos/`, `infrastructure/`, `services/`).

### Rationale for Preserved Structure

- **Repos at root**: MongoDB repository pattern is framework-agnostic; no benefit to moving into `/app/models`
- **Infrastructure at root**: Business logic actions are decoupled from framework; maintain separation
- **Services at root**: Most services (mailing, gallery, profiles, etc.) are domain services, not Rails-specific
- **Lib at root**: Utilities and caching logic are framework-agnostic

This hybrid structure leverages Rails conventions (controllers, views, assets, channels in `/app`) while maintaining the existing clean architecture (domain logic separate from framework).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**Status**: No violations - all Constitution principles satisfied. No complexity justifications required.

---

## Phase 0: Research & Resolution

**Objective**: Resolve all technical unknowns and establish Rails 8.1.2 migration best practices

**Output**: `research.md` with decisions, rationale, and alternatives considered

### Research Tasks

1. **Rails 8.1.2 Setup & Configuration**
   - Decision needed: Rails application initialization approach (rails new vs. gradual migration)
   - Research: Rails 8.1.2 new features, breaking changes from previous versions, compatibility with Ruby 3.4.4
   - Find: Best practices for initializing Rails 8.1.2 with existing codebase
   - Alternatives: rails new (clean start) vs. piecemeal addition of Rails gems

2. **MongoDB Integration with Rails 8.1.2**
   - Decision needed: MongoDB ODM/driver choice (Mongoid vs. mongo gem directly)
   - Research: Rails 8.1.2 + MongoDB integration patterns, Mongoid compatibility
   - Find: How to preserve existing `Repos::*` pattern with Rails
   - Alternatives: Mongoid (ActiveRecord-like ODM) vs. direct mongo gem (current approach) vs. Rails + ActiveRecord adapter for Mongo

3. **Controller Migration Pattern**
   - Decision needed: How to migrate Sinatra::Base controllers to ActionController::Base
   - Research: Sinatra → Rails controller migration patterns, helper method preservation (scopify, guards)
   - Find: Mapping of Sinatra DSL to Rails conventions (before filters, parameter handling, response formats)
   - Alternatives: Direct translation vs. Rails concerns/modules for shared behavior

4. **Action Cable Setup for WebSocket**
   - Decision needed: How to migrate Faye::WebSocket to Rails Action Cable
   - Research: Action Cable architecture, channel patterns, broadcasting strategies
   - Find: How to preserve WebSocket channel subscriptions and message formats
   - Alternatives: Action Cable (Rails native) vs. keep Faye::WebSocket vs. AnyCable (Action Cable alternative)

5. **Asset Pipeline Migration**
   - Decision needed: Asset pipeline approach (Sprockets vs. Propshaft vs. Vite)
   - Research: Rails 8.1 asset handling, React integration patterns, webpack preservation
   - Find: How to integrate existing React build (assets/reactjs/package.json) with Rails
   - Alternatives: Sprockets (classic) vs. Propshaft (Rails 8 default) vs. keep existing webpack setup

6. **Session Management & Authentication**
   - Decision needed: Rails session store configuration to handle forced re-authentication
   - Research: Rails session handling, cookie-based sessions vs. database sessions
   - Find: How to clear all sessions on deployment, preserve BCrypt authentication
   - Alternatives: Cookie-based sessions (default) vs. database-backed sessions vs. Redis sessions

7. **Routing Strategy**
   - Decision needed: How to preserve 7 namespace structure (/,/login, /search, /forms, /admin, /participant, /assets)
   - Research: Rails routing DSL, namespace preservation, backward-compatible routes
   - Find: How to maintain exact URL structure and route names
   - Alternatives: Rails resource routing vs. custom match routes vs. rack-mount legacy routes

8. **Middleware Stack Preservation**
   - Decision needed: How to preserve Rack middleware (Deflater, custom exception handling, CORS)
   - Research: Rails middleware stack, custom middleware integration
   - Find: Where to insert existing middleware in Rails stack
   - Alternatives: Rails middleware config vs. Rack::Builder in config.ru vs. Rails concerns

9. **Test Suite Adaptation**
   - Decision needed: RSpec setup for Rails (rails_helper vs. spec_helper)
   - Research: RSpec + Rails 8.1.2 patterns, request specs vs. controller specs
   - Find: Minimal changes to achieve 95%+ test passage
   - Alternatives: Full Rails integration (rails_helper) vs. minimal Rails loading vs. hybrid approach

10. **Background Jobs & Sidekiq**
    - Decision needed: How to integrate existing Sidekiq workers with Rails
    - Research: Rails + Sidekiq configuration, ActiveJob vs. direct Sidekiq
    - Find: Zero-change approach to preserve existing workers
    - Alternatives: Wrap in ActiveJob vs. keep direct Sidekiq vs. dual support during migration

### Research Output Format

For each task, `research.md` will document:
- **Decision**: [What was chosen]
- **Rationale**: [Why this approach]
- **Alternatives Considered**: [What else was evaluated and why rejected]
- **Implementation Notes**: [Key details for Phase 1 design]

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all decisions documented

**Outputs**: `quickstart.md`, `contracts/` directory

### Design Tasks

1. **Generate quickstart.md**
   - Content: Step-by-step Rails 8.1.2 setup instructions
   - Sections: Installation, configuration, running dev server, running tests
   - Audience: Developers setting up Rails migration for first time

2. **Generate Route Mapping Contracts**
   - Content: Sinatra route → Rails route mappings for all 7 namespaces
   - Format: OpenAPI-like or Markdown table with before/after routes
   - Output location: `contracts/routes.md`
   - Coverage: All 20+ controllers, all HTTP verbs, all path patterns

3. **Generate Data Access Contracts** (if needed based on research)
   - Content: Repository pattern integration with Rails
   - Format: Interface definitions for Repos::* classes used in Rails controllers
   - Output location: `contracts/repositories.md`
   - Coverage: Key repository methods used by controllers

4. **Update Agent Context**
   - Run: `.specify/scripts/bash/update-agent-context.sh copilot`
   - Action: Add Rails 8.1.2, Puma, Action Cable, Propshaft/Sprockets (based on research) to agent context
   - Preserve: Existing manual additions between markers

### Phase 1 Constitution Re-Check

After generating design artifacts, re-validate:
- ✅ Principle I: No NEEDS CLARIFICATION in research.md, quickstart.md, contracts/
- ✅ Principle II: User stories still independently testable with Rails approach
- ✅ Principle III: Design supports gate-driven implementation
- ✅ Principle IV: Scripts used for artifact generation
- ✅ Principle V: Decisions documented with rationale in research.md
- ⚠️ Principle VI: Ready for implementation enforcement

**Expected Status**: All gates PASS, ready for `/speckit.tasks` (Phase 2)
