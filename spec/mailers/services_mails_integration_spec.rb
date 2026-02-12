# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'ActionMailer Integration', type: :mailer do
  describe 'Services::Mails with ActionMailer' do
    let(:mailer) { Services::Mails.new }
    let(:user) do
      {
        email: 'test@example.com',
        name: 'Test User',
        lang: :en,
        id: 'user123'
      }
    end

    before do
      ActionMailer::Base.deliveries.clear
      # Initialize Dictionary with empty payload to prevent nil errors
      Dictionary.load({})
    end

    it 'delivers welcome email through ActionMailer' do
      expect do
        mailer.deliver_mail_to(user, :welcome)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)

      email = ActionMailer::Base.deliveries.last
      expect(email.to).to eq(['test@example.com'])
      expect(email.from).to eq(['notification@orfheo.org'])
    end

    it 'delivers event email through ActionMailer' do
      event_info = { event_id: 'event123', event_name: 'Test Event' }

      expect do
        mailer.deliver_mail_to(user, :event, event_info)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)

      email = ActionMailer::Base.deliveries.last
      expect(email.to).to eq(['test@example.com'])
    end

    it 'delivers forgotten password email through ActionMailer' do
      expect do
        mailer.deliver_mail_to(user, :forgotten_password)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers artist proposal email through ActionMailer' do
      proposal_data = { proposal_id: 'prop123', profile_name: 'Artist' }

      expect do
        mailer.deliver_mail_to(user, :artist_proposal, proposal_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers space proposal email through ActionMailer' do
      proposal_data = { proposal_id: 'prop456', profile_name: 'Space' }

      expect do
        mailer.deliver_mail_to(user, :space_proposal, proposal_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers rejection email through ActionMailer' do
      rejection_data = { proposal_id: 'prop789', reason: 'Test reason' }

      expect do
        mailer.deliver_mail_to(user, :rejected, rejection_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers deleted call email through ActionMailer' do
      call_data = { call_id: 'call123', call_title: 'Call Title' }

      expect do
        mailer.deliver_mail_to(user, :deleted_call, call_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers feedback email through ActionMailer' do
      feedback_data = { email: 'user@example.com', message: 'Feedback' }

      expect do
        mailer.deliver_mail_to({ email: 'info@orfheo.org' }, :feedback, feedback_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers tech support email through ActionMailer' do
      support_data = { email: 'user@example.com', issue: 'Tech issue' }

      expect do
        mailer.deliver_mail_to({ email: 'tech@orfheo.org' }, :techSupport, support_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers business email through ActionMailer' do
      business_data = { email: 'partner@example.com', inquiry: 'Business inquiry' }

      expect do
        mailer.deliver_mail_to({ email: 'info@orfheo.org' }, :business, business_data)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'delivers generic email through ActionMailer' do
      payload = {
        email_type: :standard,
        en: { subject: 'Test', body: 'Test body' }
      }

      expect do
        mailer.deliver_mail_to(user, :generic_email, payload)
      end.to change { ActionMailer::Base.deliveries.count }.by(1)
    end

    it 'handles mailing list delivery' do
      mailing_list = [
        { email: 'user1@example.com', lang: :en },
        { email: 'user2@example.com', lang: :en }
      ]
      payload = {
        email_type: :standard,
        en: { subject: 'Bulk', body: 'Bulk email' }
      }

      expect do
        mailer.deliver_to_mailing_list(mailing_list, payload, :generic_email)
      end.to change { ActionMailer::Base.deliveries.count }.by(2)
    end

    it 'handles SMTP errors gracefully' do
      # Mock the mailer to raise an SMTP error during delivery
      mail_double = double('Mail::Message')
      allow(UserMailer).to receive(:welcome_email).and_return(mail_double)
      allow(mail_double).to receive(:deliver_now).and_raise(Net::SMTPAuthenticationError.new('test error'))

      # Should not raise error, just print to console
      expect do
        mailer.deliver_mail_to(user, :welcome)
      end.not_to raise_error
    end
  end
end
