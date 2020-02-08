require 'rubygems'
require 'bundler'

Bundler.setup

require './config/config'
require './workers/workers_index' #it requires config/config 

use Rack::Deflater

require './handling'
use MyExceptionHandling

use UsersController
use ProfilesController
use ProductionsController
use SpacesController
use FreeBlocksController
use EventsController
use CallsController
use ArtistProposalsController
use SpaceProposalsController
use ActivitiesController
use ProgramsController

use ReactController

use Services::Websocket
use Services::EventSource

MetaRepos.constants.each do |repo_class|
  repo = MetaRepos.const_get(repo_class)
  Repos.const_set repo_class, repo unless Repos.const_defined? repo_class
  controller = MetaController.for(repo)
  use controller
end

map '/' do
  run WelcomeController
end

map '/login' do
  run LoginController
end

map '/search' do
	run SearchController
end

map '/forms' do
	run FormsController
end

map '/admin' do #FOR META REPOS!!!
  run AdminController
end

map '/participant' do
  run ParticipantsController
end

$stdout.sync = true #Necessary for logging puts in heroku console


# putting here the Updater, it is executed when loading a page for first time
# require './updater_events'
# EventsUpdater.run

