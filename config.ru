# This file is used by Rack-based servers to start the application.

require_relative 'config/environment'

# Mount Rails application
run Rails.application
Rails.application.load_server

# Legacy Sinatra setup (DISABLED during Rails migration - see Phase 4+ for controller migration)
#
# These routes will be migrated to config/routes.rb incrementally:
# - Phase 4: /login -> SessionsController
# - Phase 5: /search -> Search::SearchController
# - Phase 6-10: All other controllers
#
# Original Sinatra mappings (for reference):
# map '/login' do
#   run LoginController
# end
#
# map '/search' do
# 	run SearchController
# end
#
# map '/forms' do
# 	run FormsController
# end
#
# map '/admin' do #FOR META REPOS!!!
#   run AdminController
# end
#
# map '/participant' do
#   run ParticipantsController
# end

$stdout.sync = true #Necessary for logging puts in heroku console


# putting here the Updater, it is executed when loading a page for first time
# require './updater_events'
# EventsUpdater.run
