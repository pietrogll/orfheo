# require 'pony'
module Services
  
  class Mails

    def initialize mailer_api = PonyMailer 
      @mailer = mailer_api
    end

    def deliver_mail_to user, mail_type, payload = {}
      options = MailOptionsGenerator.generate_options_for(mail_type, user, payload)
      @mailer.load_options(options)
      begin
        @mailer.deliver_to user[:email]
      rescue Errno::ECONNREFUSED, Net::SMTPAuthenticationError, Net::SMTPServerBusy, Net::SMTPSyntaxError, Net::SMTPFatalError, Net::SMTPUnknownError => e
        puts e
        puts "email_not_sent_to #{user[:email]}"
      end
    end

    def deliver_to_mailing_list mailing_list, params, email_type = :generic_email
      receivers_done = mailing_list.inject([]){|receivers_done_arr, receiver|
        with_delay(1) do
          deliver_mail_to(receiver, email_type, params)
          receivers_done_arr.push(receiver)
          yield(receivers_done_arr) if block_given?
          receivers_done_arr
        end
      }
    end

    private


    def with_delay(n)
      sleep(n)
      yield
    end


    class PonyMailer

      class << self

        def deliver_to email
          Pony.mail({
            to: email,
            charset: 'UTF-8'
          })
        end

        def load_options mail_options
          Pony.options = mail_options
        end

      end
    
    end

    class MailOptionsGenerator


      STANDARD_EMAILS = [:welcome, :event, :forgotten_password, :artist_proposal, :space_proposal, :rejected, :deleted_call]
      CONTACT_EMAILS = [:feedback, :techSupport, :business]

      class << self

        def generate_options_for mail_type, user, payload
          Dictionary.load(user.merge(payload))
          @lang = (user[:lang] || Dictionary.default_language).to_sym
          @translator = Services::Translator.new @lang
          @payload = payload
          if STANDARD_EMAILS.include? mail_type.to_sym 
            standard_email_options_for(mail_type)
          elsif CONTACT_EMAILS.include? mail_type.to_sym
            contact_email_options_for(mail_type)
          else
            MailOptionsGenerator.send(mail_type)
          end
        end

        private

        def standard_email_options_for mail_type
          subject_text, body_text = get_texts_for mail_type
          footer = get_footer_for :standard
          body = prepare_body_with body_text, footer 
          generate_mail_options subject_text, body
        end

        def contact_email_options_for mail_type
          subject_text, body_text = get_texts_for mail_type
          sender = @payload[:email]
          generate_mail_options subject_text, body_text, sender
        end

        def get_texts_for mail_type
          subject_text = @translator.translate("email.#{mail_type}.subject")
          body_text = @translator.translate("email.#{mail_type}.body")
          [subject_text, body_text]
        end

        def prepare_body_with body_text, footer
          "<div style = \"color:#000000\"> #{body_text} </div> #{footer}"
        end

        def generic_email
          email_type = @payload[:email_type]
          footer = get_footer_for email_type
          default_lang = Dictionary.default_language
          payload_translated = @payload[@lang]  || @payload[default_lang]
          subject_text = payload_translated[:subject]
          body_text = payload_translated[:body]
          body = prepare_body_with body_text, footer 
          generate_mail_options subject_text, body
        end

        def generate_mail_options subject, body, sender = "orfheo community <notification@orfheo.org>"
          {
            from: sender,
            subject: subject,
            body: body
          }
        end

        def get_footer_for footer_type = :generic
          footer_text = @translator.translate "foot_note_#{footer_type}"
          footer = "<div style=\"margin-top:60px\"> <p style=\"color: #6f6f6f; font-size: 10px; \"> #{footer_text} </p>
          </div>"
        end
   
       
      end
    end
  end
end
