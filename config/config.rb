require_relative './gems'
require_relative './ours'
require 'active_support/core_ext/integer/time'

# Faye::WebSocket.load_adapter('thin') # removed thin, now using puma

class Array
  def blank?
    obj = self
    return true if !obj || obj.empty?
    obj.reject!{|el| el.respond_to?(:empty?) && el.empty?} if obj.is_a? Array
    obj.empty?
  end
end

class String
  def numeric?
    Float(self) != nil rescue false
  end
end

class BaseController < Sinatra::Base
  set :environment, (ENV['RACK_ENV'].to_sym || :production) rescue :production
  set server: 'puma', connections: []

  register Sinatra::ConfigFile

  # config_file File.join(File.dirname(__FILE__) , 'config.yml')

  set root: File.join(File.dirname(__FILE__), '..')

  set :assets_precompile, %w(
    ours.scss
    ours.js
    bundle.js
    reactForJQuery.js
    *.png
    *.jpg
    *.svg
    favicon.ico
    manifest.json
  )


  # The path to your assets
  set :assets_paths, %w(assets/reactjs/dist assets/javascripts assets/stylesheets assets/images vendor/assets/javascripts vendor/assets/stylesheets)

  # Which prefix to serve the assets under
  set :assets_prefix, '/assets'

  set :assets_css_compressor, :sass
  set :assets_js_compressor, Uglifier.new(harmony: true)

  # register Sinatra::AssetPipeline # removed: gem is not compatible with Sinatra 4.x and has been removed

  configure do
    use Rack::Session::Cookie, {
      :key => 'rack.session',
      :secret => ENV['SESSION_SECRET'] || 'b7e2c1a4e5f6d7c8b9a0f1e2d3c4b5a6e7f8d9c0b1a2e3f4d5c6b7a8e9f0d1c2b3a4e5f6d7c8b9a0f1e2d3c4b5a6e7f8d9c0b1a2e3f4d5c6b7a8e9f0d1c2' # 128 chars
    }
  end

  options = {
    :headers => { 'Content-Type' => 'text/html' },
    :via => :smtp,
    :via_options => {
      :address => ENV['MAIL_ADDRESS'],
      :port => ENV['MAIL_PORT'],
      :authentication => :plain,
      :user_name => ENV['MAIL_USER_NAME'],
      :password  => ENV['MAIL_PASSWORD'],
      :enable_starttls_auto => true
    }
  }

  Mongo::Logger.logger.level = ::Logger::FATAL

  configure :development, :test do #Run only when the environment (APP_ENV environment variable) is set to :development or :test
    puts "ENV['RACK_ENV'] --> #{ENV['RACK_ENV']}"

    # Pony configuration removed - now using ActionMailer (Rails 8)
    # Email delivery is configured in config/environments/*.rb
    puts 'Email configured via ActionMailer for development, test'
  end

  configure :production, :deployment do #Run on :production or :deployment
    puts "ENV['RACK_ENV'] --> #{ENV['RACK_ENV']}"

    # Pony configuration removed - now using ActionMailer (Rails 8)
    # Email delivery is configured in config/application.rb
    puts 'Email configured via ActionMailer for production/deployment'

  end

  configure do
    cloudinary_settings = {
      'cloud_name' => ENV['CLOUDINARY_CLOUD_NAME'],
      'api_key' => ENV['CLOUDINARY_CLOUD_API_KEY'].to_i,
      'api_secret' => ENV['CLOUDINARY_API_SECRET'],
      'cdn_subdomain' => true
    }
    Cloudinary.config(cloudinary_settings)
    puts 'configured Cloudinary'

    @@db = Mongo::Client.new(ENV['MONGOLAB_URI'] || [ '127.0.0.1:27017' ], retry_writes: false)
    ReposFactory.new(@@db).build
    MetaRepos.for @@db
    puts 'configured Mongo database'

    # uri = URI.parse(ENV["REDISTOGO_URL"] || "redis://localhost:6379/")
    # redis = Redis.new(:host => uri.host, :port => uri.port, :password => uri.password)
    # puts 'configured Redis'

    Sidekiq.configure_client do |config|
      Sidekiq::Status.configure_client_middleware config, expiration: 30.minutes
    end

    Sidekiq.configure_server do |config|
      Sidekiq::Status.configure_server_middleware config, expiration: 30.minutes
      Sidekiq::Status.configure_client_middleware config, expiration: 30.minutes
    end

  end


  configure do
    set :dump_errors, false
    set :raise_errors, true
    set :show_exceptions, false
  end

  configure do
    # it allows cross-origin frame (iframe a page)
    set :protection, except: [:frame_options]
  end

  # Helper for image paths (since asset pipeline is removed)
  helpers do
    def image_path(filename)
      "/assets/images/#{filename}"
    end
    def stylesheet_tag(filename)
      %Q{<link rel="stylesheet" href="/assets/stylesheets/#{filename}">}
    end
    def javascript_tag(filename)
      %Q{<script src="/assets/javascripts/#{filename}"></script>}
    end
  end


  # putting the updarter here, it is executed when pushing to heroku
  # puts '==========  Updater  =============='
  # require_relative '../updater_activities'
  # ActivitiesUpdater.run




end
