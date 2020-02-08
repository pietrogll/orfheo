module Actions

  class SetPeriodicMailsUpdate < BaseController

    EVENT_TO_TRIGGER = "updateDeliveryStatus"

    class << self

    def run process_id, channel

      timer = EM.add_periodic_timer(15) do
        send_process_update process_id, channel, EVENT_TO_TRIGGER
          unless is_process_running? process_id
            EM.cancel_timer(timer)
            delete_process_status process_id
          end
      end
    end

    private

    def send_process_update process_id, channel, event_to_trigger
      process_status = get_process_status_for process_id
      message = success({event: event_to_trigger, model: process_status})
      send_es_message channel, message
      message
    end

    def send_es_message channel, message
      Services::EsClients.send_message(channel, message)
    end

    def get_process_status_for process_id
      process_status = {
        total: WorkersServices::Status.total(process_id), 
        done: WorkersServices::Status.at(process_id),
        status: WorkersServices::Status.status(process_id), 
      }
    end

    def is_process_running? process_id
      WorkersServices::Status.queued?(process_id) || WorkersServices::Status.working?(process_id)
    end

    def delete_process_status process_id
      WorkersServices::Status.delete(process_id)
    end

    def success payload = {}
      message = build_message(payload)
      message.to_json
    end

    def build_message payload
      message = {status: :success}
      message = message.merge payload
    end

    end
  end

  class AdminDeletesUser
    def self.run email
      user = Repos::Users.get({email: email}).first
      raise Pard::Invalid::UnexistingUser if user.blank?
      Actions::UserDeletesUser.run user[:id]
    end
  end

  class AdminSendsEmail

    def self.with params
      process_id = Workers::BulkMailer.perform_async(params)
    end

    def self.open_call event_id
      event = Repos::Events.get_by_id event_id
      call = Repos::Calls.get_by_id event[:call_id]
      organizer = Repos::Profiles.get_by_id event[:profile_id]
      deadline = Time.at(call[:deadline].to_f / 1000)
      payload = {
        deadline: deadline.strftime("%d-%m-%Y"),
        name: event[:name],
        event_id: event[:id],
        organizer_email: organizer[:email][:value]
      }
      {
        text: open_call_text(payload),
        categories: event[:categories][:artist],
        email_type: 'event_call', 
        address: event[:address]
      }
    end

    private


    def self.open_call_text payload
      translator = Services::Translator
      Dictionary.load(payload)
      languages = Dictionary.languages
      languages.inject({}) do |texts_hash, lang|
        texts_hash[lang] = Dictionary[lang][:email][:open_call]
        texts_hash
      end
    end

   
  end

end
