module Services
  
  class MailingList

  	class << self
  	
	    def build_receivers_for emails
	    	emails.map { |email_receiver| Receiver.create(email_receiver) }
	    end

	    def get_interested_users email_type  = nil, email_content_arguments = nil
	      i_time = Time.now
	      all_interested_users = Repos::Users.all.reject{ |receiver|
	        invalid_user?(receiver[:id]) || uninterested?(receiver, email_type, email_content_arguments)
	      }
	      all_interested_users
	    end

	    private

	    def invalid_user? user_id
	      !Repos::Users.validated?(user_id)
	    end 

	    def uninterested? receiver, email_type, email_content_arguments
	      return false if (email_type.blank? || email_content_arguments.blank?)
	      has_not_interests?(receiver, email_type) || is_otherwise_interested?(receiver, email_type, email_content_arguments)
	    end

	    def has_not_interests? receiver, email_type
	      return true if receiver[:interests].blank? 
	      receiver[:interests][email_type.to_sym][:categories].blank?
	    end

	    def is_otherwise_interested? receiver, email_type, email_content_arguments
	      return true if receiver[:interests].blank?
	    	email_categories = Util.string_keyed_hash_to_symbolized(email_content_arguments)[:categories]
	    	receiver_categories_interests = receiver[:interests][email_type.to_sym][:categories]
	      (email_categories & receiver_categories_interests).empty? 
	    end

	  end

  end



  class Receiver
  	def self.create email, lang = Dictionary.default_language.to_s
  		{
  			email: email, 
  			lang: lang
  		}
  	end
  end



end