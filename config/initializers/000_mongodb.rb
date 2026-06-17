# frozen_string_literal: true

# MongoDB connection configuration for Rails
# Connects to MongoDB using the mongo gem (not Mongoid/ActiveRecord)

require 'mongo'

# Configure MongoDB client
mongodb_uri = ENV.fetch('MONGOLAB_URI', 'mongodb://localhost:27017/orfheo')

unless defined?(MONGO_CLIENT)
  MONGO_CLIENT = Mongo::Client.new(mongodb_uri)
end

# Make globally accessible for existing repository pattern
$db = MONGO_CLIENT

# Create a unique index on email for the users collection
begin
  MONGO_CLIENT[:users].indexes.create_one({ email: 1 }, unique: true)
rescue Mongo::Error::OperationFailure => e
  Rails.logger.warn "Could not create unique index on users.email: #{e.message}"
end

Rails.logger.info "MongoDB connected: #{mongodb_uri}"

# Graceful shutdown
at_exit do
  MONGO_CLIENT.close if defined?(MONGO_CLIENT)
end
