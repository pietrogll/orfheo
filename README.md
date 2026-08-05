# orfheo
This is the public repo of orfheo, now migrated to Rails 8.1.2.

## Prerequisites
- **Ruby**: 3.4.9 (managed via RVM)
- **Node.js**: 22.11.0 (managed via nvm)
- **MongoDB**: `brew tap mongodb/brew && brew install mongodb-community`
- **Redis**: `brew install redis` (Required for Action Cable and Sidekiq)

## Setup
1.  **Install dependencies**:
    ```bash
    bundle install
    cd assets/reactjs && npm install
    ```
2.  **Environment Configuration**:
    Create a `.env` file based on `.env.production`:
    ```bash
    SECRET_KEY_BASE=(run 'rails secret' to generate)
    MONGOLAB_URI=mongodb://127.0.0.1:27017/orfheo_dev
    REDIS_URL=redis://localhost:6379/1
    ```

## Running the Project
1.  **Start Services**:
    ```bash
    brew services start mongodb-community
    brew services start redis
    ```
2.  **Start Rails Server**:
    ```bash
    bin/rails server
    ```
3.  **Start React Build**:
    ```bash
    cd assets/reactjs
    npm run build-watch
    ```
4.  **Open in Browser**:
    `http://localhost:3000`

## Background Jobs
Run Sidekiq:
```bash
bundle exec sidekiq -r ./config/environment.rb
```

## Sync Local DB from Production

1.  **Get the production URI**:
    ```bash
    heroku config:get MONGOLAB_URI
    ```

2.  **Dump from production**:

    ```bash
    mongodump --uri="$MONGOLAB_URI" --archive=orfheo_prod.dump --gzip --tls --tlsInsecure
    ```

3.  **Restore to local** (pipe via `zcat` to handle namespace correctly):

    ```bash
    zcat orfheo_prod.dump | mongorestore --uri="mongodb://127.0.0.1:27017/orfheo_dev" \
      --archive --drop \
      --nsInclude="$(echo "$MONGOLAB_URI" | sed -n 's|.*/\([^?]*\).*|\1|p').*"
    ```

    This restores all collections under the production database namespace. If the restore creates a separate `heroku_1qqrwjjv` database instead of writing to `orfheo_dev`, migrate the collections:

    ```bash
    mongosh mongodb://127.0.0.1:27017 --quiet --eval "
      const fromDB = 'heroku_1qqrwjjv', toDB = 'orfheo_dev';
      db.getSiblingDB(fromDB).getCollectionNames().forEach(c => {
        db.getSiblingDB(toDB).getCollection(c).drop();
        db.adminCommand({ renameCollection: fromDB + '.' + c, to: toDB + '.' + c });
      });
      db.getSiblingDB(fromDB).dropDatabase();
      print('Migrated to ' + toDB);
    "
    ```

    > `--drop` clears existing local data before restoring. Omit it to keep local collections not present in production.

## API Documentation
Regenerate `openapi/openapi.yaml` from request specs:
```bash
SWAGGER_DRY_RUN=0 RAILS_ENV=test rails rswag
```
The documentation is also viewable at `/api-docs` when the server is running.