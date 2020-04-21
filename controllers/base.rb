class BaseController < Sinatra::Base

  before do
    headers 'Access-Control-Allow-Origin' => 'http://localhost',
            'Access-Control-Allow-Methods' => ['OPTIONS', 'GET', 'POST']
  end

  helpers do

    def respond_with_json
      content_type :json
    end

    def success payload = {}
      respond_with_json
      message = build_message(payload)
      message.to_json
    end

    def scopify *param_projection
      param_projection.each do |param|
        self.send(:define_singleton_method, param) {
          params[param]
        }
      end
    end

    def send_web_socket_message websocket_channel, event_to_trigger, model, signature = nil
      message = success({event: event_to_trigger, model: model})
      Services::WsClients.send_message(websocket_channel, message, signature)
      message
    end

    def check_admin!
      raise Pard::Invalid::Admin unless admin?
    end

    def admin?
      MetaRepos::Admins.exists? session[:identity]
    end

    def check_invalid_email email
      raise Pard::Invalid.new 'invalid_email' if email.blank? || invalid_email?(email)
    end

    def check_invalid_password password
      raise Pard::Invalid.new 'invalid_password' if invalid_password? password
    end

    def check_lang! lang
      raise Pard::Invalid.new 'invalid_language' unless ['en', 'es', 'ca'].include? lang
    end

    def check_call_ownership! call_id
      raise Pard::Invalid.new 'non_existing_call' unless Repos::Calls.exists? call_id
      owner_id = Repos::Calls.get_owner(call_id)
      raise Pard::Invalid.new 'call_ownership' unless (owner_id == session[:identity] || admin?)
      owner_id 
    end

    def check_profile_ownership! profile_id      
      raise Pard::Invalid::UnexistingProfile unless Repos::Profiles.exists? profile_id      
      owner_id = Repos::Profiles.get_owner(profile_id)
      raise Pard::Invalid::ProfileOwnership unless (owner_id == session[:identity] || admin?)
      owner_id
    end

    def check_event_ownership! event_id
      raise Pard::Invalid::UnexistingEvent unless Repos::Events.exists? event_id
      owner_id = Repos::Events.get_owner(event_id)
      raise Pard::Invalid::EventOwnership unless (owner_id == session[:identity] || admin?)
      owner_id
    end

    def check_db_element_owneship! db_key, id
      check_db_element_exists! db_key, id
      owner_id = ApiStorage.repos(db_key).get_owner id
      raise Pard::Invalid::Ownership unless (owner_id == session[:identity] || admin?)
      owner_id
    end

    def check_db_element_exists! db_key, id
      Actions::CheckDbElementExistence.run db_key, id
    end


    def check_event_exists! event_id
      raise Pard::Invalid::UnexistingEvent unless Repos::Events.exists? event_id
    end

    def status_for owner
      return :admin if admin?
      return :owner if owner == session[:identity]
      return :visitor if (!session[:identity].blank? && owner != session[:identity])
      :outsider
    end 

    def user_lang
      return nil if !session[:identity] 
      Repos::Users.get_by_id(session[:identity])[:lang]
    end

    def check_empty_call! call_id
      call = Repos::Calls.get_by_id(call_id)
      raise Pard::Invalid::EmptyCall unless call.nil? || call[:participants].blank?
      call
    end

    def check_empty_program! program_id
      program = Repos::Programs.get_by_id(program_id)
      raise Pard::Invalid::EmptyProgram unless program.nil? || program[:activities].blank?
      program
    end

    def check_future_event! event_id
      raise Pard::Invalid::FutureEvent unless admin? || is_future_event?(event_id)
    end

    def is_future_event? event_id
      Repos::Events.is_future_event? event_id
    end 

    def clean_session
      session.delete(:identity)
      session.delete(:last_login)
    end

    
    private

    def build_message payload
      message = {status: :success}
      message = message.merge payload
    end

    def invalid_email? email
      (email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i).nil?
    end

    def invalid_password? password
      password.blank? || password.size < 8
    end
  end
end