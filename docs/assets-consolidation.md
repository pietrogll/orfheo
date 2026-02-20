# Asset Consolidation Plan (app/assets as source of truth)

Goal: remove ambiguity between `app/assets` and `assets` by consolidating to `app/assets`, while keeping runtime behavior stable.

## Current state (confirmed)

- Entry assets are linked from `app/assets/config/manifest.js`.
- Layout includes `ours` and `bundle` from asset helpers.
- Sprockets resolves duplicate logical assets (`ours.js`, `ours.css`, `websocket.js`) to `app/assets` first.
- `bundle.js` is served from `assets/reactjs/dist`.
- Many transitive JS modules are currently only in `assets/javascripts/**`.

## Migration phases

### Phase 1 — Baseline (safe)

- [x] Add duplicate drift audit task (`rake assets:audit_duplicates`)
- [x] Add migration checklist doc
- [x] Capture and attach baseline output of:
  - `bundle exec rake assets:audit_duplicates`
  - `bundle exec rails runner 'env=Rails.application.assets; %w[ours.js ours.css websocket.js layout.js forms.js event.js profiles.js admin.js bundle.js].each{|lp| a=env.find_asset(lp); puts "#{lp} -> #{a&.filename}" }'`

### Phase 2 — Move transitive JS modules

- [x] Copy root-only subfolders from `assets/javascripts/**` to `app/assets/javascripts/**`:
  - `admin`, `call_proposals`, `event`, `eventManager`, `forms`, `forms_builder`,
    `languages`, `layout`, `profiles`, `services`, `users`, `welcome`, `widgets`
- [x] Keep exact relative paths and filenames to preserve Sprockets logical requires.
- [x] Verify no behavior change:
  - `bundle exec rails runner '...find_asset(...)...'` (same winners)
  - smoke flows: home, search, event manager, modify call popup

### Phase 3 — Remove duplicate top-level files in root `assets`

- [x] Remove duplicate copied module folders from `assets/javascripts/**`
  after app copies are confirmed correct.
- [x] Remove remaining duplicate top-level files from `assets/javascripts` and `assets/stylesheets`
  once drifted files are reconciled.
- [x] Keep `app/assets` versions authoritative.
- [x] Re-run `rake assets:audit_duplicates`.
- [x] Resolve vendor stylesheet hard-reference to removed root path:
  `vendor/assets/stylesheets/scss/_settings.scss` now imports
  `app/assets/stylesheets/custom_settings`.

### Phase 4 — Remove root path injections (except react dist)

- [x] In `config/initializers/assets.rb`, remove:
  - `assets/javascripts`
  - `assets/stylesheets`
  - `assets/images`
  - `assets/font`
- [ ] Keep `assets/reactjs/dist` path until React pipeline migration is done.
- [x] Validate with precompile + app boot + smoke checks.
- [x] Adjust stylesheet import after path cleanup:
  - `app/assets/stylesheets/ours.scss` now uses `@import "vendors"`
    instead of relative `../../vendor/...`.

### Phase 5 — Cleanup and guardrail

- [x] Remove obsolete files under root `assets` (excluding `reactjs/dist` while needed).
- [ ] Add CI step for `bundle exec rake assets:audit_duplicates FAIL_ON_DIFF=1`
  to prevent future drift.

## Verification gates (every phase)

1. `bundle exec rake assets:audit_duplicates`
2. `bundle exec rails assets:clobber assets:precompile`
3. Target specs:
   - `bundle exec rspec spec/requests/calls_spec.rb`
   - `bundle exec rspec spec/requests/profiles_spec.rb`
4. Manual UI checks:
   - `/`
   - `/search/profiles`
   - event manager + call modify flow

## Rollback

- Keep each phase in separate PR.
- Rollback method: revert the single PR for the active phase.
- No irreversible config deletion until Phase 4 passes all gates.
