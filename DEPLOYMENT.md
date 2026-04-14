# Deployment Guide

This document outlines the deployment process for the Orfheo Rails application.

## Prerequisites

-   Ruby 3.4.4
-   Node.js & npm
-   MongoDB instance
-   Redis instance (for Sidekiq & Action Cable)
-   SMTP Server credentials

## Environment Variables

Ensure the following variables are set in the production environment (e.g., Heroku Config Vars, `.env.production`):

-   `RAILS_ENV`: `production`
-   `SECRET_KEY_BASE`: (Generated via `rails secret`)
-   `MONGOLAB_URI`: MongoDB connection string
-   `REDIS_URL`: Redis connection string
-   `MAIL_ADDRESS`, `MAIL_PORT`, `MAIL_USER_NAME`, `MAIL_PASSWORD`: SMTP settings
-   `RAILS_SERVE_STATIC_FILES`: `true` (if not using Nginx/Apache to serve public/)
-   `RAILS_LOG_TO_STDOUT`: `true`

## Deployment Checklist

1.  **Push to Heroku**:
    The frontend build (`npm run build-production`) is now **automated** via the root `package.json`.
    We have configured Webpack (`systemvars: true`) to pick up your Heroku Config Vars during the build process, so you no longer need to build locally.
    ```bash
    git push heroku master
    ```

2.  **Manual Build (Local Testing)**:
    If you need to build locally for testing:
    ```bash
    npm run build          # Runs from root, delegates to assets/reactjs
    RAILS_ENV=production bundle exec rails assets:precompile
    ```

3.  **Database Migration**:
    -   (No ActiveRecord migrations needed as we use MongoDB with Repository pattern)
    -   Ensure `MONGOLAB_URI` points to a valid database.

4.  **Start Application**:
    -   Use `Procfile` to start Puma (web) and Sidekiq (worker):
    ```bash
    foreman start
    ```
    -   Or run manually:
    ```bash
    bundle exec puma -C config/puma.rb
    bundle exec sidekiq -c 2 -v -r ./workers/sidekiq_workers.rb
    ```

## Rollback Procedure

In case of a failed deployment:

1.  **Revert Code**: checkout the previous stable git tag/commit.
2.  **Rebuild Assets**: Run the build and precompile steps again for the old version.
3.  **Restart Services**: Restart Puma and Sidekiq.
4.  **Database**: Since we use MongoDB without strict schema migrations, verify data integrity if the failed version modified data structures.

## User Communication Plan

-   **Maintenance Mode**: If downtime is expected, enable maintenance page (if configured at load balancer level).
-   **Notification**: Notify users via email or status page if critical features (like messaging) are affected.

## Common Issues

-   **Asset Compilation Fails**: Ensure all SCSS files are properly imported in `ours.scss` and not linked individually in manifest if they are partials.
-   **Action Cable Connection Refused**: Check `config.action_cable.allowed_request_origins` in `production.rb` or ensure generic access is allowed if strict mode isn't configured.
-   **Missing Constants (NameError)**: Legacy code (`repos`, `lib`, `services`, `infrastructure`) is loaded MANUALLY in `config/initializers/load_sinatra_config.rb`. Do not expect Zeitwerk autoloading for these folders.
