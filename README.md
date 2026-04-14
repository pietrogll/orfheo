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