# frozen_string_literal: true

# Configure Cloudinary from environment variables.
# The app stores the API key under CLOUDINARY_CLOUD_API_KEY while the gem
# auto-reads CLOUDINARY_API_KEY or CLOUDINARY_URL.  Map them explicitly so
# that Cloudinary::Api operations (delete_resources, etc.) always have
# credentials available.
Cloudinary.config do |config|
  config.cloud_name  = ENV['CLOUDINARY_CLOUD_NAME']  if ENV['CLOUDINARY_CLOUD_NAME'].present?
  config.api_key     = ENV['CLOUDINARY_CLOUD_API_KEY'] if ENV['CLOUDINARY_CLOUD_API_KEY'].present?
  config.api_secret  = ENV['CLOUDINARY_API_SECRET']   if ENV['CLOUDINARY_API_SECRET'].present?
end
