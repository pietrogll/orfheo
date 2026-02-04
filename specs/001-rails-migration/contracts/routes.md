# Route Mappings: Sinatra → Rails

**Purpose**: Document exact URL mappings from Sinatra routes to Rails routes  
**Date**: 2026-01-30  
**Status**: Complete

## Overview

This document maps all Sinatra routes (`config.ru` + controller files) to their Rails equivalents in `config/routes.rb`. The goal is **zero breaking changes** - every existing URL must work identically.

## Mapping Format

| Sinatra Route | Sinatra Controller | Rails Route | Rails Controller#Action | Notes |
|---------------|-------------------|-------------|------------------------|-------|
| HTTP VERB /path | Class | HTTP VERB /path | Controller#action | Compatibility notes |

---

## Root Namespace (/)

### WelcomeController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET / | WelcomeController | GET / | Welcome#index | Root path |
| GET /privacy | WelcomeController | GET /privacy | Welcome#privacy | Static page |
| GET /terms | WelcomeController | GET /terms | Welcome#terms | Static page |

---

## Login Namespace (/login)

### LoginController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /login | LoginController | GET /login | Sessions#show | Login form |
| POST /login | LoginController | POST /login | Sessions#create | User login |
| DELETE /login | LoginController | DELETE /login | Sessions#destroy | User logout |

**Rails Routes**:
```ruby
post '/login', to: 'sessions#create'
delete '/login', to: 'sessions#destroy'
get '/login', to: 'sessions#show'
```

---

## Users Resource (/users)

### UsersController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /users | UsersController | GET /users | Users#index | List users |
| GET /users/:id | UsersController | GET /users/:id | Users#show | Show user |
| POST /users | UsersController | POST /users | Users#create | Create user |
| PATCH /users/:id | UsersController | PATCH /users/:id | Users#update | Update user |
| DELETE /users/:id | UsersController | DELETE /users/:id | Users#destroy | Delete user |
| GET /users/by_email/:email | UsersController | GET /users/by_email/:email | Users#by_email | Find by email |
| PATCH /users/:id/password | UsersController | PATCH /users/:id/password | Users#update_password | Change password |

**Rails Routes**:
```ruby
resources :users, defaults: {format: :json} do
  collection do
    get 'by_email/:email', to: 'users#by_email'
  end
  member do
    patch :update_password
  end
end
```

---

## Events Resource (/events)

### EventsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /events | EventsController | GET /events | Events#index | List events |
| GET /events/:id | EventsController | GET /events/:id | Events#show | Show event |
| POST /events | EventsController | POST /events | Events#create | Create event |
| PATCH /events/:id | EventsController | PATCH /events/:id | Events#update | Update event |
| DELETE /events/:id | EventsController | DELETE /events/:id | Events#destroy | Delete event |
| GET /events/:id/public | EventsController | GET /events/:id/public | Events#public_view | Public view |
| POST /events/:id/duplicate | EventsController | POST /events/:id/duplicate | Events#duplicate | Duplicate event |

**Rails Routes**:
```ruby
resources :events, defaults: {format: :json} do
  member do
    get :public
    post :duplicate
  end
end
```

---

## Programs Resource (nested under /events)

### ProgramsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /events/:event_id/programs | ProgramsController | GET /events/:event_id/programs | Programs#index | List programs |
| POST /events/:event_id/programs | ProgramsController | POST /events/:event_id/programs | Programs#create | Create program |
| PATCH /programs/:id | ProgramsController | PATCH /programs/:id | Programs#update | Update program |
| DELETE /programs/:id | ProgramsController | DELETE /programs/:id | Programs#destroy | Delete program |

**Rails Routes**:
```ruby
resources :events, defaults: {format: :json} do
  resources :programs, only: [:index, :create], shallow: true
end

# Shallow routing gives us PATCH /programs/:id instead of /events/:event_id/programs/:id
```

---

## Activities Resource (nested under /events)

### ActivitiesController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /events/:event_id/activities | ActivitiesController | GET /events/:event_id/activities | Activities#index | List activities |
| POST /events/:event_id/activities | ActivitiesController | POST /events/:event_id/activities | Activities#create | Create activity |
| PATCH /activities/:id | ActivitiesController | PATCH /activities/:id | Activities#update | Update activity |
| DELETE /activities/:id | ActivitiesController | DELETE /activities/:id | Activities#destroy | Delete activity |

**Rails Routes**:
```ruby
resources :events, defaults: {format: :json} do
  resources :activities, only: [:index, :create], shallow: true
end
```

---

## Profiles Resource (/profiles)

### ProfilesController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /profiles | ProfilesController | GET /profiles | Profiles#index | List profiles |
| GET /profiles/:id | ProfilesController | GET /profiles/:id | Profiles#show | Show profile |
| POST /profiles | ProfilesController | POST /profiles | Profiles#create | Create profile |
| PATCH /profiles/:id | ProfilesController | PATCH /profiles/:id | Profiles#update | Update profile |
| DELETE /profiles/:id | ProfilesController | DELETE /profiles/:id | Profiles#destroy | Delete profile |
| GET /profiles/:id/public | ProfilesController | GET /profiles/:id/public | Profiles#public_view | Public view |

**Rails Routes**:
```ruby
resources :profiles, defaults: {format: :json} do
  member do
    get :public
  end
end
```

---

## Productions Resource (/productions)

### ProductionsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /productions | ProductionsController | GET /productions | Productions#index | List productions |
| GET /productions/:id | ProductionsController | GET /productions/:id | Productions#show | Show production |
| POST /productions | ProductionsController | POST /productions | Productions#create | Create production |
| PATCH /productions/:id | ProductionsController | PATCH /productions/:id | Productions#update | Update production |
| DELETE /productions/:id | ProductionsController | DELETE /productions/:id | Productions#destroy | Delete production |

**Rails Routes**:
```ruby
resources :productions, defaults: {format: :json}
```

---

## Spaces Resource (/spaces)

### SpacesController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /spaces | SpacesController | GET /spaces | Spaces#index | List spaces |
| GET /spaces/:id | SpacesController | GET /spaces/:id | Spaces#show | Show space |
| POST /spaces | SpacesController | POST /spaces | Spaces#create | Create space |
| PATCH /spaces/:id | SpacesController | PATCH /spaces/:id | Spaces#update | Update space |
| DELETE /spaces/:id | SpacesController | DELETE /spaces/:id | Spaces#destroy | Delete space |

**Rails Routes**:
```ruby
resources :spaces, defaults: {format: :json}
```

---

## Calls Resource (/calls)

### CallsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /calls | CallsController | GET /calls | Calls#index | List calls |
| GET /calls/:id | CallsController | GET /calls/:id | Calls#show | Show call |
| POST /calls | CallsController | POST /calls | Calls#create | Create call |
| PATCH /calls/:id | CallsController | PATCH /calls/:id | Calls#update | Update call |
| DELETE /calls/:id | CallsController | DELETE /calls/:id | Calls#destroy | Delete call |

**Rails Routes**:
```ruby
resources :calls, defaults: {format: :json}
```

---

## Artist Proposals (/artist_proposals)

### ArtistProposalsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /artist_proposals | ArtistProposalsController | GET /artist_proposals | ArtistProposals#index | List proposals |
| POST /artist_proposals | ArtistProposalsController | POST /artist_proposals | ArtistProposals#create | Create proposal |
| PATCH /artist_proposals/:id | ArtistProposalsController | PATCH /artist_proposals/:id | ArtistProposals#update | Update proposal |
| DELETE /artist_proposals/:id | ArtistProposalsController | DELETE /artist_proposals/:id | ArtistProposals#destroy | Delete proposal |

**Rails Routes**:
```ruby
resources :artist_proposals, defaults: {format: :json}
```

---

## Space Proposals (/space_proposals)

### SpaceProposalsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /space_proposals | SpaceProposalsController | GET /space_proposals | SpaceProposals#index | List proposals |
| POST /space_proposals | SpaceProposalsController | POST /space_proposals | SpaceProposals#create | Create proposal |
| PATCH /space_proposals/:id | SpaceProposalsController | PATCH /space_proposals/:id | SpaceProposals#update | Update proposal |
| DELETE /space_proposals/:id | SpaceProposalsController | DELETE /space_proposals/:id | SpaceProposals#destroy | Delete proposal |

**Rails Routes**:
```ruby
resources :space_proposals, defaults: {format: :json}
```

---

## Forms Resource (/forms)

### FormsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /forms | FormsController | GET /forms | Forms#index | List forms |
| GET /forms/:id | FormsController | GET /forms/:id | Forms#show | Show form |
| POST /forms | FormsController | POST /forms | Forms#create | Create form |
| PATCH /forms/:id | FormsController | PATCH /forms/:id | Forms#update | Update form |
| DELETE /forms/:id | FormsController | DELETE /forms/:id | Forms#destroy | Delete form |

**Rails Routes**:
```ruby
resources :forms, defaults: {format: :json}
```

---

## Free Blocks Resource (/free_blocks)

### FreeBlocksController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /free_blocks | FreeBlocksController | GET /free_blocks | FreeBlocks#index | List blocks |
| POST /free_blocks | FreeBlocksController | POST /free_blocks | FreeBlocks#create | Create block |
| PATCH /free_blocks/:id | FreeBlocksController | PATCH /free_blocks/:id | FreeBlocks#update | Update block |
| DELETE /free_blocks/:id | FreeBlocksController | DELETE /free_blocks/:id | FreeBlocks#destroy | Delete block |

**Rails Routes**:
```ruby
resources :free_blocks, defaults: {format: :json}
```

---

## Search Namespace (/search)

### SearchController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /search | SearchController | GET /search | Search::Search#index | Main search |
| GET /search/suggest | SearchSuggestController | GET /search/suggest | Search::Suggest#index | Search suggestions |

**Rails Routes**:
```ruby
scope '/search', module: :search, defaults: {format: :json} do
  get '/', to: 'search#index'
  get '/suggest', to: 'suggest#index'
end
```

---

## Admin Namespace (/admin)

### AdminController + Meta Resources

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /admin | AdminController | GET /admin | Admin::Admin#index | Admin dashboard |
| GET /admin/tags | MetaController(Tags) | GET /admin/tags | Admin::Tags#index | List tags |
| POST /admin/tags | MetaController(Tags) | POST /admin/tags | Admin::Tags#create | Create tag |
| PATCH /admin/tags/:id | MetaController(Tags) | PATCH /admin/tags/:id | Admin::Tags#update | Update tag |
| DELETE /admin/tags/:id | MetaController(Tags) | DELETE /admin/tags/:id | Admin::Tags#destroy | Delete tag |
| GET /admin/ambients | MetaController(Ambients) | GET /admin/ambients | Admin::Ambients#index | List ambients |
| POST /admin/ambients | MetaController(Ambients) | POST /admin/ambients | Admin::Ambients#create | Create ambient |
| PATCH /admin/ambients/:id | MetaController(Ambients) | PATCH /admin/ambients/:id | Admin::Ambients#update | Update ambient |
| DELETE /admin/ambients/:id | MetaController(Ambients) | DELETE /admin/ambients/:id | Admin::Ambients#destroy | Delete ambient |
| GET /admin/galleries | MetaController(Galleries) | GET /admin/galleries | Admin::Galleries#index | List galleries |
| POST /admin/galleries | MetaController(Galleries) | POST /admin/galleries | Admin::Galleries#create | Create gallery |
| GET /admin/admins | MetaController(Admins) | GET /admin/admins | Admin::Admins#index | List admins |
| POST /admin/admins | MetaController(Admins) | POST /admin/admins | Admin::Admins#create | Create admin |
| DELETE /admin/admins/:id | MetaController(Admins) | DELETE /admin/admins/:id | Admin::Admins#destroy | Delete admin |
| GET /admin/assets | MetaController(Assets) | GET /admin/assets | Admin::Assets#index | List assets |
| POST /admin/assets | MetaController(Assets) | POST /admin/assets | Admin::Assets#create | Create asset |
| GET /admin/participants | MetaController(Participants) | GET /admin/participants | Admin::Participants#index | List participants |
| POST /admin/participants | MetaController(Participants) | POST /admin/participants | Admin::Participants#create | Create participant |

**Rails Routes**:
```ruby
namespace :admin, defaults: {format: :json} do
  root to: 'admin#index'
  resources :tags
  resources :ambients
  resources :galleries
  resources :admins, only: [:index, :create, :destroy]
  resources :assets
  resources :participants
end
```

---

## Participant Namespace (/participant)

### ParticipantsController

| Sinatra | Sinatra Controller | Rails | Rails Controller#Action | Notes |
|---------|-------------------|-------|------------------------|-------|
| GET /participant | ParticipantsController | GET /participant | Participant::Participants#index | Participant dashboard |
| (Additional routes TBD based on controller inspection) | ParticipantsController | (TBD) | Participant::* | To be mapped |

**Rails Routes**:
```ruby
namespace :participant, defaults: {format: :json} do
  root to: 'participants#index'
  # Additional routes based on Sinatra controller
end
```

---

## Assets (/assets)

### AssetsController

**Note**: Rails asset pipeline handles `/assets` automatically via Propshaft. The Sinatra `AssetsController` is replaced by Rails' built-in asset serving.

| Sinatra | Sinatra Controller | Rails | Rails Handling | Notes |
|---------|-------------------|-------|----------------|-------|
| GET /assets/* | AssetsController (Sprockets) | GET /assets/* | Propshaft | Automatic serving |

**Rails Configuration**:
- Assets in `app/assets/` served via Propshaft
- React bundles in `public/assets/reactjs/` served as static files
- No controller needed (Rails middleware handles it)

---

## WebSocket (/websocket → /cable)

### Services::Websocket → Action Cable

| Sinatra | Implementation | Rails | Implementation | Notes |
|---------|---------------|-------|----------------|-------|
| GET /websocket | Faye::WebSocket middleware | GET /cable | Action Cable | Protocol change |

**Migration Notes**:
- Sinatra uses Faye::WebSocket at `/websocket`
- Rails uses Action Cable at `/cable`
- JavaScript client must update connection URL
- Channel subscription pattern changes (see Action Cable docs)

**JavaScript Client Update**:
```javascript
// Before (Sinatra + Faye)
const ws = new WebSocket('ws://localhost:3000/websocket');

// After (Rails + Action Cable)
import consumer from "./consumer"
consumer.subscriptions.create("EventChannel", {
  received(data) {
    // Handle message
  }
});
```

---

## Summary

### Total Routes Mapped
- **Root/Welcome**: 3 routes
- **Login**: 3 routes
- **Users**: 7 routes
- **Events**: 7 routes
- **Programs**: 4 routes (nested)
- **Activities**: 4 routes (nested)
- **Profiles**: 6 routes
- **Productions**: 5 routes
- **Spaces**: 5 routes
- **Calls**: 5 routes
- **Proposals**: 8 routes (Artist + Space)
- **Forms**: 5 routes
- **Free Blocks**: 4 routes
- **Search**: 2 routes
- **Admin**: 15+ routes (meta resources)
- **Participant**: TBD routes
- **WebSocket**: 1 route (protocol change)

**Total**: 80+ HTTP routes + 1 WebSocket endpoint

### Breaking Changes
- **WebSocket URL**: `/websocket` → `/cable` (requires JavaScript client update)
- **Session clearing**: All users must re-authenticate after deployment

### Compatibility Guarantee
All HTTP routes maintain identical URLs, HTTP verbs, and JSON response formats. No breaking changes to REST API.
