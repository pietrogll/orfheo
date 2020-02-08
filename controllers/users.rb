class UsersController < BaseController

  before '/users/*' do
    if !session[:identity] then
      redirect '/'
    end
  end

  get '/users/' do
    profiles = Actions::UserGetsProfiles.run session[:identity]
    erb :users, :locals => {:profiles => profiles.to_json}
  end

  post '/users/header' do
    profiles, events, interests = Actions::UserGetsHeader.run session[:identity]
    admin = admin?
    success({profiles: profiles, events: events, admin: admin, interests: interests})
  end

  post '/users/modify_password' do
    scopify :password
    check_invalid_password password
    Actions::UserModifiesPassword.run session[:identity], password
    success
  end

  post '/modify_lang' do  
    scopify :lang
    check_lang! lang
    return success if session[:identity].blank?
    Actions::UserModifiesLanguage.run session[:identity], lang
    success
  end

  post '/users/save_interests' do
    scopify :interests
    return success if session[:identity].blank?
    Actions::UserModifiesInterests.run session[:identity], interests
    success
  end

  get '/users/get_user_email' do
    user_email = Actions::UserGetsEmail.run session[:identity]
    success({user_email: user_email})
  end

  post '/users/delete_user' do
    Actions::UserDeletesUser.run session[:identity]
    clean_session
    success
  end

end
