class SearchController < BaseController


  get '/proposals' do
    status = status_for session[:identity]
    erb :react_index, :locals => {status: status.to_json}
  end

  get '/spaces' do
    status = status_for session[:identity]
    erb :react_index, :locals => {status: status.to_json}
  end

  get '/profiles' do
    status = status_for session[:identity]
    erb :react_index, :locals => {status: status.to_json}
  end

  get '/events' do
    status = status_for session[:identity]
    erb :react_index, :locals => {status: status.to_json}
  end

  post '/load_results' do
    scopify :pull_params, :db_key, :query
    results, updated_pull_params = Actions::Search::LoadResults.run(pull_params, db_key, query)
    success({db_key => results, pull_params: updated_pull_params})
  end

  get '/public_info' do
    scopify :id, :db_key
    db_element = Actions::GetPublicInfo.run db_key, id
    success({db_element: db_element})
  end

  private

  def status_for session_identity
    return :visitor unless session[:identity].blank?
    :outsider
  end

end