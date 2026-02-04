require 'sidekiq'
require 'sidekiq/api'
require 'sidekiq/web'
require 'sidekiq-status'

require 'sucker_punch'

require 'sinatra/config_file'
# require 'sinatra/asset_pipeline' # removed: gem is not compatible with Sinatra 4.x and has been removed
require 'sinatra/sprockets-helpers'
require 'sprockets/es6'
require 'uglifier'

require 'uuid'
# require 'pony' - Migrated to ActionMailer (Rails 8)
require 'mongo'
require 'cloudinary'
require 'active_support'
require 'active_support/core_ext/object'
require 'time'
require 'net/http'
require 'faye/websocket'

require 'bcrypt'

require 'dotenv/load'
