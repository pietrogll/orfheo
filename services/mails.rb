# ActionMailer adapter for orfheo
# Migrated from Pony to ActionMailer (Rails 8)
module Services

  class Mails

    def initialize(mailer_api = ActionMailerAdapter)
      @mailer = mailer_api
    end

    def deliver_mail_to(user, mail_type, payload = {})
      begin
        @mailer.deliver_to(user, mail_type, payload)
      rescue Errno::ECONNREFUSED, Net::SMTPAuthenticationError, Net::SMTPServerBusy, Net::SMTPSyntaxError, Net::SMTPFatalError, Net::SMTPUnknownError => e
        puts e
        puts "email_not_sent_to #{user[:email]}"
      end
    end

    def deliver_to_mailing_list(mailing_list, params, email_type = :generic_email)
      receivers_done = mailing_list.inject([]) do |receivers_done_arr, receiver|
        with_delay(1) do
          deliver_mail_to(receiver, email_type, params)
          receivers_done_arr.push(receiver)
          yield(receivers_done_arr) if block_given?
          receivers_done_arr
        end
      end
    end

    private

    def with_delay(n)
      sleep(n)
      yield
    end

    # ActionMailer adapter to replace Pony
    class ActionMailerAdapter
      class << self
        def deliver_to(user, mail_type, payload = {})
          case mail_type.to_sym
          when :welcome
            UserMailer.welcome_email(user).deliver_now
          when :event
            UserMailer.event_email(user, payload).deliver_now
          when :forgotten_password
            UserMailer.forgotten_password_email(user).deliver_now
          when :generic_email
            UserMailer.generic_email(user, payload).deliver_now
          when :artist_proposal
            ProposalMailer.artist_proposal_email(user, payload).deliver_now
          when :space_proposal
            ProposalMailer.space_proposal_email(user, payload).deliver_now
          when :rejected
            ProposalMailer.rejection_email(user, payload).deliver_now
          when :deleted_call
            ProposalMailer.deleted_call_email(user, payload).deliver_now
          when :feedback
            ContactMailer.feedback_email(user[:email], payload).deliver_now
          when :techSupport
            ContactMailer.tech_support_email(user[:email], payload).deliver_now
          when :business
            ContactMailer.business_email(user[:email], payload).deliver_now
          else
            raise ArgumentError, "Unknown mail type: #{mail_type}"
          end
        end
      end
    end
  end
end
