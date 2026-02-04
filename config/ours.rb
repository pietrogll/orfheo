require_relative '../exceptions'
require_relative '../helpers'

require_relative '../repos/repos_index'
require_relative '../lib/libs_index'
require_relative '../services/services_index'

# Load only BaseController for Actions support, skip other Sinatra controllers
require_relative '../controllers/base'
# require_relative '../controllers/controllers_index' # Disabled - migrating to Rails app/controllers

require_relative '../infrastructure/actions_index' #use BaseControllers -> must be loaded after
