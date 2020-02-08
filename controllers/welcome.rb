class WelcomeController < BaseController

  get '/' do
    if session[:identity]
      new_last_login_time = Actions::UpdateLoginTime.run session[:identity], session[:last_login]
      session[:last_login] = new_last_login_time
      redirect '/users/'
    end
    erb :welcome
  end

  get '/services' do
  	status = :visitor if session[:identity]
    status = :outsider if session[:identity].blank?
    erb :services, :locals => {status: status.to_json}
  end

  post '/feedback' do
		check_params! params
		check_invalid_email params[:email]
		Actions::SendContactEmails.run :feedback, params
		success
	end

	post '/techSupport' do
		check_params! params
		check_invalid_email params[:email]
		Actions::SendContactEmails.run :techSupport, params
		success
	end

	post '/business' do
		check_business_params! params
		check_invalid_email params[:email]
		Actions::SendContactEmails.run :business, params
		success
	end

	private
	def check_params! params
		raise Pard::Invalid::Params if [:email, :name, :message].any?{|field| params[field].blank?}
	end

	def check_business_params! params
		raise Pard::Invalid::Params if [:email, :name, :message, :subject].any?{|field| params[field].blank?}
	end

end

