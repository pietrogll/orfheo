require_relative '../config/config'

module Workers

	class BulkMailer
	
	  include Sidekiq::Worker
	  include Sidekiq::Status::Worker

  	sidekiq_options retry:false

  	def expiration
	    @expiration ||= 60 * 60 * 24 * 30 # 30 days = 60sec * 60min * 24h * 24d
	  end

	  def perform	params
	  	params = Util.string_keyed_hash_to_symbolized(params)
	  	mailing_list = get_receivers_for params
	  	mailing_list_length = mailing_list.count

	  	total mailing_list_length
      
      receivers_done = send_email_to(mailing_list, params)
      [mailing_list_length, receivers_done.count]
		end

		private


		def send_email_to mailing_list, params
     	Services::Mails.new.deliver_to_mailing_list(mailing_list, params) do |receivers_done|
	  		at receivers_done.length
     	end
    end

    def get_receivers_for params
      return Services::MailingList.build_receivers_for(params[:receivers]) unless params[:receivers].nil? || params[:receivers].empty?
      Services::MailingList.get_interested_users(params[:email_type], params[:target])
    end

	end
end
