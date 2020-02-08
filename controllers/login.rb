class LoginController < BaseController

  post '/register' do
    scopify :email, :password, :lang, :event_id
    check_params email, password
    check_lang! lang
    check_non_existing_user email
    Actions::UserRegistersUser.run event_id, params
    success
  end

  get '/validate' do
    user_id, saved_login_time = Actions::UserValidatesUser.run params[:id]
    redirect '/' unless user_id
    register_session(user_id, saved_login_time)
    redirect "http://www.orfheo.org/event?id=#{params[:event_id]}" if Repos::Events.exists? params[:event_id]
    redirect "http://www.orfheo.org/users/"
  end

# ATT!!!!!
  # get '/open_settings' do 
  #   redirect '/' unless (Repos::Users.exists?({id: params[:id]}) || Repos::Users.validated?(params[:id]))
  #   session[:identity] = params[:id]
  #   redirect "http://www.orfheo.org/users/#&settings"
  # end

  post '/login' do    
    scopify :email, :password
    check_params email, password
    check_existing_user email.downcase
    user, saved_login_time = Actions::UserLogsIn.run email.downcase, password
    register_session(user[:id], saved_login_time)
    success({lang: user[:lang]})
  end

  post '/logout' do
    clean_session
    success
  end

  post '/forgotten_password' do
    scopify :email
    check_invalid_email email
    check_existing_user email.downcase

    Actions::UserResetsPassword.run email.downcase
    success
  end


  private

  def register_session user_id, saved_login_time
    session[:identity] = user_id
    session[:last_login] = saved_login_time
  end

  def check_params email, password
    check_invalid_email email
    check_invalid_password password
  end

  def check_non_existing_user email
    raise Pard::Invalid::ExistingUser if user_exists? email
  end

  def check_existing_user email
    raise Pard::Invalid::UnexistingUser unless user_exists? email
  end

  def user_exists? email
    Repos::Users.exists? email: email
  end
end
