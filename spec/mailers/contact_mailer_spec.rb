# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ContactMailer, type: :mailer do
  before do
    # Initialize Dictionary with empty payload to prevent nil errors
    Dictionary.load({})
  end

  describe 'feedback_email' do
    let(:feedback_data) do
      {
        email: 'user@example.com',
        name: 'Feedback User',
        message: 'Great platform!',
        lang: :en
      }
    end
    let(:mail) { ContactMailer.feedback_email('info@orfheo.org', feedback_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['info@orfheo.org'])
      expect(mail.from).to eq(['user@example.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'tech_support_email' do
    let(:support_data) do
      {
        email: 'user@example.com',
        name: 'Tech User',
        issue: 'Cannot upload images',
        lang: :en
      }
    end
    let(:mail) { ContactMailer.tech_support_email('tech@orfheo.org', support_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['tech@orfheo.org'])
      expect(mail.from).to eq(['user@example.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'business_email' do
    let(:business_data) do
      {
        email: 'partner@example.com',
        name: 'Business Partner',
        inquiry: 'Partnership opportunity',
        lang: :en
      }
    end
    let(:mail) { ContactMailer.business_email('info@orfheo.org', business_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['info@orfheo.org'])
      expect(mail.from).to eq(['partner@example.com'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end
end
