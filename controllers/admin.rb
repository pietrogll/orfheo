class AdminController < BaseController


  get '/' do
    raise Pard::Unexisting unless admin?
    status = :admin
    erb :admin, :locals => {status: status.to_json, admin_id: session[:identity].to_json}
  end

  post '/open_call_email' do
    scopify :event_id
    check_admin!
    check_event_exists! event_id
    open_call_email = Actions::AdminSendsEmail.open_call event_id
    success(open_call_email)
  end

  post '/send_email' do
    check_admin!
    check_params params
    process_id = Actions::AdminSendsEmail.with params
     Actions::SetPeriodicMailsUpdate.run(process_id, session[:identity])
    success
  end

  post '/delete_user' do
    scopify :email
    check_admin!
    Actions::AdminDeletesUser.run email
    success
  end

  private
  
    def check_params params
      params[:receivers].each{|email_receiver| check_invalid_email email_receiver} unless params[:receivers].blank?
      default_lang = Dictionary.default_language
      raise Pard::Invalid::Params if (params[default_lang].blank? || [params[default_lang].values].any?{|component| component.blank? })
    end

end
