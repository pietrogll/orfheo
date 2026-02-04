require 'rails_helper'

RSpec.describe ProposalMailer, type: :mailer do
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

  describe 'artist_proposal_email' do
    let(:proposal_data) do
      {
        proposal_id: 'proposal123',
        profile_name: 'Test Artist',
        event_name: 'Test Event'
      }
    end
    let(:mail) { ProposalMailer.artist_proposal_email(user, proposal_data) }

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

  describe 'space_proposal_email' do
    let(:proposal_data) do
      {
        proposal_id: 'proposal456',
        profile_name: 'Test Space',
        event_name: 'Test Event'
      }
    end
    let(:mail) { ProposalMailer.space_proposal_email(user, proposal_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'rejection_email' do
    let(:rejection_data) do
      {
        proposal_id: 'proposal789',
        reason: 'Does not fit event theme'
      }
    end
    let(:mail) { ProposalMailer.rejection_email(user, rejection_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end

  describe 'deleted_call_email' do
    let(:call_data) do
      {
        call_id: 'call123',
        call_title: 'Artist Call 2026',
        event_name: 'Test Event'
      }
    end
    let(:mail) { ProposalMailer.deleted_call_email(user, call_data) }

    it 'renders the headers' do
      expect(mail.subject).to be_present
      expect(mail.to).to eq(['test@example.com'])
      expect(mail.from).to eq(['notification@orfheo.org'])
    end

    it 'renders the body' do
      expect(mail.body.encoded).to be_present
    end
  end
end
