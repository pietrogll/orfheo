# Load Sinatra configuration (repos, services, infrastructure, exceptions)
# This ensures all Sinatra-era code is available in the Rails environment

# Load exceptions first
require_relative '../../exceptions'

# Load helpers
require_relative '../../helpers'

# Load repos manually (not via Zeitwerk - they use non-standard module structure)
require_relative '../../repos/repos_index'

# Load libs
require_relative '../../lib/libs_index'

# Load services (now autoloaded by Zeitwerk, but ensure they're available)
# require_relative '../../services/services_index' # Skip - autoloaded by Zeitwerk

# Load BaseController and Guards (needed by Actions)
require_relative '../../controllers/base'

# Load infrastructure actions
require_relative '../../infrastructure/actions_index'

# Initialize ReposFactory with MongoDB connection
# This creates Repos::* classes dynamically
if defined?(MONGO_CLIENT) && !defined?(Repos::Users)
  ReposFactory.new(MONGO_CLIENT).build
  MetaRepos.for MONGO_CLIENT
  Rails.logger.info 'Initialized ReposFactory with MongoDB connection'
end
