# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Services::Cloudflare do
  describe '.purge_program_cache' do
    let(:event_id) { 'event-123' }
    let(:zone_id) { 'zone-abc' }
    let(:api_token) { 'token-xyz' }
    let(:domain) { 'example.com' }

    before do
      allow(ENV).to receive(:fetch).and_call_original
      allow(ENV).to receive(:fetch).with('CLOUDFLARE_ZONE_ID', nil).and_return(zone_id)
      allow(ENV).to receive(:fetch).with('CLOUDFLARE_API_TOKEN', nil).and_return(api_token)
      allow(ENV).to receive(:fetch).with('DOMAIN_NAME', nil).and_return(domain)
    end

    subject { described_class.purge_program_cache(event_id) }

    let(:expected_headers) do
      {
        'Authorization' => 'Bearer token-xyz',
        'Content-Type' => 'application/json'
      }
    end

    context 'when all environment variables are present' do
      let(:expected_body) do
        {
          files: [
            'https://example.com/api/v1/events/event-123/program?lang=es',
            'https://example.com/api/v1/events/event-123/program?lang=en',
            'https://example.com/api/v1/events/event-123/program?lang=ca',
            'https://example.com/api/v1/events/event-123/program',
            'https://www.example.com/api/v1/events/event-123/program?lang=es',
            'https://www.example.com/api/v1/events/event-123/program?lang=en',
            'https://www.example.com/api/v1/events/event-123/program?lang=ca',
            'https://www.example.com/api/v1/events/event-123/program'
          ]
        }.to_json
      end

      before do
        allow(described_class).to receive(:post)
      end

      it 'calls post on itself with the correct endpoint, headers, and body' do
        subject
        expect(described_class).to have_received(:post).with(
          '/zones/zone-abc/purge_cache',
          headers: expected_headers,
          body: expected_body
        )
      end
    end

    context 'when DOMAIN_NAME already includes www' do
      let(:domain) { 'www.example.com' }
      let(:expected_body) do
        {
          files: [
            'https://www.example.com/api/v1/events/event-123/program?lang=es',
            'https://www.example.com/api/v1/events/event-123/program?lang=en',
            'https://www.example.com/api/v1/events/event-123/program?lang=ca',
            'https://www.example.com/api/v1/events/event-123/program'
          ]
        }.to_json
      end

      before do
        allow(described_class).to receive(:post)
      end

      it 'purges the canonical host once' do
        subject
        expect(described_class).to have_received(:post).with(
          '/zones/zone-abc/purge_cache',
          headers: expected_headers,
          body: expected_body
        )
      end
    end

    context 'when CLOUDFLARE_ZONE_ID is blank' do
      let(:zone_id) { '' }

      before do
        allow(described_class).to receive(:post)
      end

      it 'does not call post' do
        subject
        expect(described_class).not_to have_received(:post)
      end
    end

    context 'when CLOUDFLARE_API_TOKEN is blank' do
      let(:api_token) { nil }

      before do
        allow(described_class).to receive(:post)
      end

      it 'does not call post' do
        subject
        expect(described_class).not_to have_received(:post)
      end
    end

    context 'when DOMAIN_NAME is blank' do
      let(:domain) { nil }

      before do
        allow(described_class).to receive(:post)
      end

      it 'does not call post' do
        subject
        expect(described_class).not_to have_received(:post)
      end
    end

    context 'when post raises an error' do
      let(:error) { StandardError.new('API Error') }

      before do
        allow(described_class).to receive(:post).and_raise(error)
        allow(Rails.logger).to receive(:error)
      end

      it 'logs the failure' do
        subject
        expect(Rails.logger).to have_received(:error).with('Cloudflare Purge failed: API Error')
      end
    end
  end
end
