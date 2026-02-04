class AssetsController < Sinatra::Base
  set :root, File.expand_path('../..', __FILE__)

  get '/assets/*' do
    file_path = File.join(settings.root, 'assets', params['splat'].first)
    if File.exist?(file_path)
      content_type Rack::Mime.mime_type(File.extname(file_path))
      send_file file_path
    else
      halt 404
    end
  end
end
