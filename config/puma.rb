# Puma web server configuration

# Load environment variables
require 'dotenv'
Dotenv.load

# Specifies the number of `workers` to boot in clustered mode.
workers ENV.fetch("WEB_CONCURRENCY") { 2 }

# Specifies the `port` that Puma will listen on.
port ENV.fetch("PORT") { 3000 }

# Specifies the `environment` that Puma will run in.
environment ENV.fetch("RAILS_ENV") { "development" }

# Specifies the `pidfile` that Puma will use.
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Allow puma to be restarted by `bin/rails restart` command.
plugin :tmp_restart

# Specifies the number of `threads` to use per worker.
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

# Preload the application before starting workers
preload_app!

# Allow puma to be started from any directory
# Ensure tmp directories exist
before_fork do
  # Puma worker killer disabled during migration - re-enable in production if needed
  # require 'puma_worker_killer'
  # PumaWorkerKiller.enable_rolling_restart # Default is every 6 hours

  # Close any database connections before forking
  if defined?(Mongo)
    Mongo::Logger.logger.level = Logger::INFO
  end
end
