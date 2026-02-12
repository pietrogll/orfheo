# frozen_string_literal: true

require './infrastructure/actions_index'

describe 'Actions::ContactEmails' do
  let(:mailer) { Services::Mails.new }

  let(:business_params) do
    {
      email: 'email@email.email',
      name: 'sender_name',
      subject: 'email_subject',
      contactPhone: false,
      contactHangout: false,
      phone: '123123123',
      dayAvailabilty: 'availability',
      periodAvailabilty: 'always',
      links: 'links',
      message: 'email_message'
    }
  end
  let(:business_receiver) do
    {
      email: 'info@orfheo.org'
    }
  end

  before(:each) do
    allow(Services::Mails).to receive(:new).and_return(mailer)
  end

  describe 'run' do
    it 'sends businnes emails' do
      expect(mailer).to receive(:deliver_mail_to).with(business_receiver, :business, business_params)
      Actions::SendContactEmails.run :business, business_params
    end
  end
end
