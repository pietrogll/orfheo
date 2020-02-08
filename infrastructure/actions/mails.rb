module Actions

  class SendContactEmails

  	PAYLOAD_KEYS = {
  		business: [:email, :name, :subject, :contactPhone, :contactHangout, :phone, :dayAvailabilty, :periodAvailabilty, :links, :message],
  		feedback: [:email, :name, :message],
  		techSupport: [:email, :name, :subject, :profile, :browser, :message]
  		} 

  	RECEIVERS = {
  		business: 'info@orfheo.org',
  		feedback: 'info@orfheo.org',
  		techSupport: 'tech@orfheo.org'
  	}

  	class << self
	  	
	  	def run mail_type, params
	  		payload, receiver = get_from(mail_type, params)
	  		mailer = Services::Mails.new
	  		mailer.deliver_mail_to(receiver, mail_type, payload)
	  	end

	  	private

	  	def get_from mail_type, params
	  		payload = pepare_payload mail_type, params
	  		receiver = pepare_receiver mail_type
	  		[payload, receiver]
	  	end

	  	def pepare_payload mail_type, params
	  		PAYLOAD_KEYS[mail_type].inject({}) do |hash_params, key|
	  			hash_params[key] = params[key]
	  			hash_params
	  		end
	  	end

	  	def pepare_receiver mail_type
	  		{email: RECEIVERS[mail_type]}
	  	end

  	end
  end

end