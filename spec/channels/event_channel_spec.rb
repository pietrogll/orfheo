# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventChannel, type: :channel do
  let(:event_id) { '12345678-1234-1234-1234-123456789abc' }
  let(:user_signature) { 'test@example.com' }

  before do
    stub_connection(current_user_signature: user_signature)
  end

  describe '#subscribed' do
    it 'subscribes to the event stream' do
      subscribe(event_id: event_id)

      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from("event:#{event_id}")
    end

    it 'does not subscribe without event_id' do
      subscribe(event_id: nil)

      expect(subscription).to be_confirmed
      expect(subscription).not_to have_stream_from("event:")
    end
  end

  describe '#unsubscribed' do
    it 'stops all streams when unsubscribed' do
      subscribe(event_id: event_id)
      expect(subscription).to be_confirmed

      unsubscribe
      expect(subscription).not_to have_streams
    end
  end

  describe 'broadcasting' do
    it 'receives broadcasted messages' do
      subscribe(event_id: event_id)

      message = { status: 'success', event: 'event_updated', model: { id: event_id } }

      expect {
        ActionCable.server.broadcast("event:#{event_id}", message)
      }.to have_broadcasted_to("event:#{event_id}").with(message)
    end
  end
end
