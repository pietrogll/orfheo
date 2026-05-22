# Security Changes and Endpoint Permissions

Last updated: 2026-05-22

## Summary

The Rails controller layer now keeps the existing cookie-session model for the web frontend, but hardens it in the following ways:

- HTTPS is enforced in production via `config.force_ssl = true`.
- Session cookies are explicitly configured as `httponly`, `same_site: :lax`, and `secure` in production.
- CORS no longer allows `*`; it is restricted to `ORFHEO_ALLOWED_ORIGINS` with a safe default allowlist for `orfheo.org` and local development.
- CSRF protection now uses the standard Rails exception flow for authenticated write endpoints.
- The frontend automatically refreshes the CSRF token from the `X-CSRF-Token` response header after successful AJAX requests.
- Session rotation is applied on login and account validation; logout resets the whole session.
- Password reset no longer reuses account-validation links. It now uses a dedicated, expiring, single-use reset token and `/reset_password`.
- Public request logs now filter secrets such as `password`, `token`, `authenticity_token`, cookies, session data, and authorization-like fields.
- Public profile listing no longer exposes hidden `email` / `phone` fields.
- `/forms/get_call_forms` now requires call ownership or admin rights.
- `/users/profile_productions_spaces` now requires profile ownership or admin rights.
- Public event payloads no longer expose organizer email.
- The legacy “remember me” feature no longer stores plaintext passwords in `localStorage`.

## Authentication and Authorization Model

- Web authentication is cookie-session based.
- Logged-in identity is `session[:identity]`.
- Admin status is determined by `MetaRepos::Admins.exists?(session[:identity])`.
- Ownership checks are enforced through controller guards such as:
  - `check_event_ownership!`
  - `check_profile_ownership!`
  - `check_call_ownership!`
  - `check_db_element_ownership!`
  - resource-specific ownership helpers for forms, programs, spaces, productions, free blocks, and proposals

### Permission labels used below

- `Public`: no login required.
- `Authenticated`: any logged-in user.
- `Owner`: the owner of the underlying resource.
- `Call owner`: the owner of the call.
- `Event owner`: the owner of the event.
- `Profile owner`: the owner of the profile.
- `Admin`: application admin.
- `Owner/Admin`: owner of the target resource or admin.

## Endpoint Permission Matrix

### Platform and session endpoints

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/health` | `GET` | Public | Plain health check. |
| `/up` | `GET` | Public | Rails health endpoint. |
| `/` | `GET` | Public | Redirects logged-in users to `/users`. |
| `/services` | `GET` | Public | Informational page. |
| `/cable` | WebSocket | Authenticated | Uses the same session cookie as the web app. |
| `/register` | `POST` | Public | Rate limited. Creates a non-validated user and sends validation email. |
| `/login/register` | `POST` | Public | Legacy alias for `/register`. |
| `/login` | `POST` | Public | Rate limited. Creates session on valid login. |
| `/login/login` | `POST` | Public | Legacy alias for `/login`. |
| `/login` | `GET` | Public | Returns current session state. |
| `/logout` | `POST` | Authenticated | Resets session. |
| `/login/logout` | `POST` | Authenticated | Legacy alias for `/logout`. |
| `/login` | `DELETE` | Authenticated | Alternative logout. |
| `/validate` | `GET` | Public | Rate limited. Consumes account validation token and creates session. |
| `/login/validate` | `GET` | Public | Legacy alias for `/validate`. |
| `/forgotten_password` | `POST` | Public | Rate limited. Issues dedicated reset token and sends reset email. |
| `/login/forgotten_password` | `POST` | Public | Legacy alias. |
| `/reset_password` | `GET` | Public | Renders reset-password page if token is valid. |
| `/login/reset_password` | `GET` | Public | Legacy alias. |
| `/reset_password` | `POST` | Public | Consumes valid reset token and sets new password. |
| `/login/reset_password` | `POST` | Public | Legacy alias. |

### Account endpoints

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/users` | `GET` | Authenticated | HTML page for current user; unauthenticated users are redirected to `/`. |
| `/users/header` | `POST` | Authenticated | Returns current user header data. |
| `/users/modify_password` | `POST` | Authenticated | CSRF protected. Changes the current user password. |
| `/users/save_interests` | `POST` | Public/Authenticated | Returns success for anonymous users; only persists for logged-in users. |
| `/users/get_user_email` | `GET` | Authenticated | Returns current user email. |
| `/users/delete_user` | `POST` | Authenticated | Deletes current user and resets session. |
| `/modify_lang` | `POST` | Public/Authenticated | Returns success for anonymous users; only persists for logged-in users. |

### Public event and profile browsing

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/events` | `GET` | Public | Returns public event listing. |
| `/event` | `GET` | Public | Returns public event by `id`. |
| `/event/:slug` | `GET` | Public | Returns public event by slug. |
| `/profiles` | `GET` | Public | Returns public profile list with hidden contact fields filtered out. |
| `/profile` | `GET` | Public | Returns public profile by `id`. |
| `/profile/:slug` | `GET` | Public | Redirects to `/profile?id=...`. |
| `/event_manager` | `GET` | Owner/Admin | Event manager page shell. |
| `/program` | `GET` | Owner/Admin | Returns program only to owner/admin. |

### Event management

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/users/create_event` | `POST` | Profile owner/Admin | Creates an event under a profile. |
| `/users/modify_event` | `POST` | Event owner/Admin | Modifies event. |
| `/users/delete_event` | `POST` | Event owner/Admin | Deletes event. |
| `/users/update_partners` | `POST` | Event owner/Admin | Updates partner content/media. |
| `/users/event_manager` | `POST` | Event owner/Admin | Returns manager data for event. |
| `/users/check_slug` | `POST` | Authenticated | Checks slug availability. |
| `/users/create_slug` | `POST` | Event owner/Admin | Sets initial event slug. |

### Program and activity management

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/users/create_program` | `POST` | Event owner/Admin | Creates program. |
| `/users/modify_program` | `POST` | Program owner/Admin | Modifies program; blocked for past events. |
| `/users/delete_program` | `POST` | Admin | Delete is admin-only. |
| `/users/space_order` | `POST` | Event owner/Admin | Reorders spaces. |
| `/users/publish` | `POST` | Event owner/Admin | Publishes program. |
| `/users/artist_subcategories_price` | `POST` | Event owner/Admin | Updates artist pricing metadata. |
| `/users/set_permanents` | `POST` | Event owner/Admin | Updates permanent activity mappings. |
| `/users/create_performances` | `POST` | Event owner/Admin | Creates activities. |
| `/users/modify_performances` | `POST` | Event owner/Admin | Modifies activities. |
| `/users/delete_performances` | `POST` | Event owner/Admin | Deletes activities. |

### Profile, production, space, and availability management

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/users/create_profile` | `POST` | Authenticated | Creates profile for current user. |
| `/users/modify_profile` | `POST` | Profile owner/Admin | Updates profile. |
| `/users/modify_profile_name` | `POST` | Profile owner/Admin | Route aliases to profile update. |
| `/users/modify_profile_description` | `POST` | Profile owner/Admin | Route aliases to profile update. |
| `/users/delete_profile` | `POST` | Profile owner/Admin | Deletes profile and related content. |
| `/users/check_name` | `POST` | Authenticated | Checks profile name availability. |
| `/users/list_profiles` | `POST` | Authenticated | Lists profiles owned by current user. |
| `/users/profile_productions_spaces` | `POST` | Profile owner/Admin | Returns productions/spaces/submitted spaces for owned profile only. |
| `/users/create_production` | `POST` | Profile owner/Admin | Creates production. |
| `/users/modify_production` | `POST` | Production owner/Admin | Updates production. |
| `/users/delete_production` | `POST` | Production owner/Admin | Deletes production. |
| `/users/create_space` | `POST` | Profile owner/Admin | Creates space. |
| `/users/modify_space` | `POST` | Space owner/Admin | Updates space. |
| `/users/delete_space` | `POST` | Space owner/Admin | Deletes space. |
| `/users/create_free_block` | `POST` | Profile owner/Admin | Creates availability block. |
| `/users/modify_free_block` | `POST` | Free-block owner/Admin | Updates availability block. |
| `/users/delete_free_block` | `POST` | Free-block owner/Admin | Deletes availability block. |

### Calls and forms

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/call` | `GET` | Admin | Returns call by `id`. |
| `/users/call` | `GET` | Admin | Alias for `/call`. |
| `/users/create_call` | `POST` | Profile owner/Admin | Creates call for a profile/event. |
| `/users/delete_call` | `POST` | Admin | Call delete remains admin-only. |
| `/users/modify_call` | `POST` | Call owner/Admin | Modifies call. |
| `/users/checks_participant_name` | `POST` | Authenticated | Checks participant name availability within a call/program context. |
| `/users/add_whitelist` | `POST` | Call owner/Admin | Adds whitelist entry; blocked for past events. |
| `/users/delete_whitelist` | `POST` | Call owner/Admin | Removes whitelist entry; blocked for past events. |
| `/users/get_call_proposals` | `POST` | Call owner/Admin | Returns proposals for a call. |
| `/forms` | `POST` | Public | Returns forms filtered by current user/whitelist visibility. |
| `/forms/get_call_forms` | `POST` | Call owner/Admin | Returns raw call forms without public filtering. |
| `/forms/create` | `POST` | Call owner/Admin | Creates form. |
| `/forms/modify` | `POST` | Form owner/Admin | Updates form. |
| `/forms/delete` | `POST` | Form owner/Admin | Deletes form. |

### Proposal submission and participant management

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/users/send_artist_proposal` | `POST` | Authenticated + profile owner/event owner | Uses profile or event ownership depending on `own=true`. |
| `/users/amend_artist_proposal` | `POST` | Proposal owner/Call owner/Admin | Amends proposal. |
| `/users/modify_artist_proposal` | `POST` | Proposal owner/Call owner/Admin | Modifies proposal; blocked for past events. |
| `/users/delete_artist_proposal` | `POST` | Proposal owner/Call owner/Admin | Deletes proposal; blocked for past events. |
| `/users/select_artist_proposal` | `POST` | Proposal owner/Call owner/Admin | Selects proposal; blocked for past events. |
| `/users/modify_param_proposal` | `POST` | Call owner/Admin | Updates proposal parameter directly; blocked for past events. |
| `/users/send_space_proposal` | `POST` | Authenticated + profile owner/event owner | Uses profile or event ownership depending on `own=true`. |
| `/users/amend_space_proposal` | `POST` | Proposal owner/Call owner/Admin | Amends proposal. |
| `/users/modify_space_proposal` | `POST` | Proposal owner/Call owner/Admin | Modifies proposal; blocked for past events. |
| `/users/select_space_proposal` | `POST` | Proposal owner/Call owner/Admin | Selects proposal; blocked for past events and programmed spaces. |
| `/users/delete_space_proposal` | `POST` | Proposal owner/Call owner/Admin | Deletes proposal; blocked for past events. |
| `/participant/modify` | `POST` | Participant owner/Admin | Modifies participant; blocked for past events. |

### Search and public info

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/search/proposals` | `GET` | Public | Search page shell. |
| `/search/spaces` | `GET` | Public | Search page shell. |
| `/search/profiles` | `GET` | Public | Search page shell. |
| `/search/events` | `GET` | Public | Search page shell. |
| `/search/load_results` | `POST` | Public | Search results loader. |
| `/search/public_info` | `GET` | Public | Returns public info for supported `db_key` values. |
| `/search/suggest` | `POST` | Authenticated | Protected search suggestions for profiles in event/call contexts. |
| `/search/results` | `POST` | Authenticated | Protected search results for profiles in event/call contexts. |
| `/search/suggest_program` | `POST` | Public | Public program suggestions. |
| `/search/results_program` | `POST` | Public | Public program results. |
| `/search/suggest_tags` | `POST` | Public | Public tag suggestions. |
| `/search/suggest_event_names` | `POST` | Public | Public event-name suggestions. |

### Admin endpoints

All `/admin/*` endpoints require `Admin`.

| Endpoint | Method | Permission | Notes |
|---|---|---:|---|
| `/admin` | `GET` | Admin | Admin dashboard. |
| `/admin/tags` | `GET/POST` | Admin | Tag management. |
| `/admin/tags/:id` | `PATCH/PUT/DELETE` | Admin | Tag update/delete. |
| `/admin/ambients` | `GET/POST` | Admin | Ambient management. |
| `/admin/ambients/:id` | `PATCH/PUT/DELETE` | Admin | Ambient update/delete. |
| `/admin/galleries` | `GET/POST` | Admin | Gallery management. |
| `/admin/galleries/:id` | `PATCH/PUT/DELETE` | Admin | Gallery update/delete. |
| `/admin/admins` | `GET/POST` | Admin | Admin management. |
| `/admin/admins/:id` | `DELETE` | Admin | Admin delete. |
| `/admin/assets` | `GET/POST` | Admin | Asset management. |
| `/admin/assets/:id` | `PATCH/PUT/DELETE` | Admin | Asset update/delete. |
| `/admin/participants` | `GET/POST` | Admin | Participant management. |
| `/admin/participants/:id` | `PATCH/PUT/DELETE` | Admin | Participant update/delete. |

## CSRF model after the hardening

- CSRF is enforced on authenticated write endpoints.
- Public authentication/bootstrap endpoints intentionally exempted from CSRF verification:
  - login
  - register
  - forgotten password
  - validation link
  - reset-password page display
- `/forms` listing remains CSRF-exempt because it is a public read-style POST used by the existing frontend.
- The frontend reads the refreshed CSRF token from `X-CSRF-Token` after every successful AJAX request and updates the page token in place.

## Logging and secret handling

The following parameters are filtered from Rails logs:

- `password`
- `password_confirmation`
- `token`
- `reset_password_token`
- `validation_code`
- `authenticity_token`
- `cookie`
- `cookies`
- `session`
- `_orfheo_session`
- `authorization`

## Notes and known design choices

- The web app remains session-based; bearer tokens were not introduced in this phase.
- Some legacy routes still use `POST` for reads; permissions above reflect the current code, not ideal REST shape.
- `/forms` is intentionally public because proposal sign-up depends on it for event participation flows.
- `/users/save_interests` and `/modify_lang` remain anonymous-safe for compatibility, but they only persist changes for logged-in users.
