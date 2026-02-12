# frozen_string_literal: true

module Actions
  class SendContactEmails
    PAYLOAD_KEYS = {
      business: %i[email name subject contactPhone contactHangout phone dayAvailabilty periodAvailabilty
                   links message],
      feedback: %i[email name message],
      techSupport: %i[email name subject profile browser message]
    }.freeze

    RECEIVERS = {
      business: 'info@orfheo.org',
      feedback: 'info@orfheo.org',
      techSupport: 'tech@orfheo.org'
    }.freeze

    class << self
      def run(mail_type, params)
        payload, receiver = get_from(mail_type, params)
        mailer = Services::Mails.new
        mailer.deliver_mail_to(receiver, mail_type, payload)
      end

      private

      def get_from(mail_type, params)
        payload = pepare_payload mail_type, params
        receiver = pepare_receiver mail_type
        [payload, receiver]
      end

      def pepare_payload(mail_type, params)
        PAYLOAD_KEYS[mail_type].each_with_object({}) do |key, hash_params|
          hash_params[key] = params[key]
        end
      end

      def pepare_receiver(mail_type)
        { email: RECEIVERS[mail_type] }
      end
    end
  end
end
