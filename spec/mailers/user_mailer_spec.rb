# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  before do
    # Initialize Dictionary with empty payload to prevent nil errors
    Dictionary.load({})
  end

  let(:user) do
    {
      email: 'test@example.com',
      name: 'Test User',
      lang: :en,
      id: 'user123'
    }
  end

  describe 'welcome_email' do
    let(:mail) { UserMailer.welcome_email(user) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
      expect(mail.body.encoded).to include('div')
    end

    it 'includes footer' do
      expect(mail.body.encoded).to include('margin-top:60px')
    end
  end

  describe 'event_email' do
    let(:event_info) do
      {
        event_id: 'event123',
        event_name: 'Test Event',
        event_date: '2026-02-15'
      }
    end
    let(:mail) { UserMailer.event_email(user, event_info) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'forgotten_password_email' do
    let(:mail) { UserMailer.forgotten_password_email(user) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'generic_email' do
    let(:payload) do
      {
        email_type: :standard,
        en: {
          subject: 'Test Subject',
          body: 'Test Body Content'
        }
      }
    end
    let(:mail) { UserMailer.generic_email(user, payload) }

    it 'renders the headers' do
      expect(mail.subject).to eq('Test Subject')
      expect(mail.to).to eq(['test@example.com'])
    end

    it 'renders the body with custom content' do
      expect(mail.body.encoded).to include('Test Body Content')
    end
  end
end
