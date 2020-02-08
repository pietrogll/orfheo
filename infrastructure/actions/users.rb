module Actions

  class UserRegistersUser
    
    def self.run event_id, params
      user = User.new params
      mailer = Services::Mails.new
      if Repos::Events.exists?(event_id)
        mailer.deliver_mail_to user.to_h, :event, event_info(params[:event_id]) 
      else 
        mailer.deliver_mail_to user.to_h, :welcome
      end
      Repos::Users.save user.to_h
    end

    def self.event_info event_id
      {
        event_id: event_id,
        event_name: Repos::Events.get_by_id(event_id)[:name]
      }
    end

  end

  class UserValidatesUser
    def self.run code
      return false unless (is_correct_code?(code) && code_belongs_to_user?(code))
      user_id = Repos::Users.validate code
      stored_time = Services::Users.register_login user_id
      [user_id, stored_time]
    end
    
    private

    def self.is_correct_code? code
      UUID.validate code
    end

    def self.code_belongs_to_user? code
      Repos::Users.exists?({validation_code: code})
    end


  end

  class UserLogsIn
    def self.run email, password
      user = Repos::Users.get({email: email}).first
      check_user! user, email, password
      stored_time = Services::Users.register_login user[:id]
      [user, stored_time]
    end

    private 

    def self.check_user! user, email, password
      raise Pard::Invalid::Password unless is_correct_password?(user[:password], password)
      raise Pard::Invalid::Unvalidated unless user[:validation] == true
    end

    def self.is_correct_password? password, password_to_check
      Services::Encryptor.check_equality(password, password_to_check)
    end



  end

  class UpdateLoginTime
    def self.run user_id, time_stored = 0
      seconds_diff = (Time.now.to_i - time_stored.to_i).abs
      hours = seconds_diff / 3600
      time_stored = Services::Users.register_login(user_id) unless hours < 24
      time_stored
    end
  end

  class UserModifiesLanguage
    def self.run user_id, lang
      Repos::Users.modify({id: user_id, lang: lang})
    end
  end

  class UserModifiesInterests
    def self.run user_id, interests
      Repos::Users.modify({id: user_id, interests: interests})
    end
  end

  class UserModifiesPassword
    def self.run user_id, password
      encrypted_password = Services::Encryptor.encrypt password
      Repos::Users.modify({id: user_id, password: encrypted_password})
    end
  end

  class UserResetsPassword
    def self.run email
      user = Repos::Users.reseted_user email
      mailer = Services::Mails.new 
      mailer.deliver_mail_to user, :forgotten_password
    end
  end

  class UserGetsEmail
    def self.run user_id
      user = Repos::Users.get({id: user_id}).first
      user[:email]
    end
  end


  class UserDeletesUser
    def self.run user_id
      Repos::Profiles.get_user_profiles(user_id).each{ |profile|
        Actions::UserDeletesProfile.run profile[:id]
      }
      Repos::Users.delete user_id
    end
  end
end
