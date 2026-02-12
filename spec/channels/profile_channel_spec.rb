# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProfileChannel, type: :channel do
  let(:profile_id) { 'abcdef12-5678-9012-3456-abcdef123456' }
  let(:user_signature) { 'test@example.com' }

  before do
    stub_connection(current_user_signature: user_signature)
  end

  describe '#subscribed' do
    it 'subscribes to the profile stream' do
      subscribe(profile_id: profile_id)

      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from("profile:#{profile_id}")
    end

    it 'does not subscribe without profile_id' do
      subscribe(profile_id: nil)

      expect(subscription).to be_confirmed
      expect(subscription).not_to have_stream_from('profile:')
    end
  end

  describe '#unsubscribed' do
    it 'stops all streams when unsubscribed' do
      subscribe(profile_id: profile_id)
      expect(subscription).to be_confirmed

      unsubscribe
      expect(subscription).not_to have_streams
    end
  end

  describe 'broadcasting' do
    it 'receives broadcasted messages' do
      subscribe(profile_id: profile_id)

      message = { status: 'success', data: { event: 'profile_updated', model: { id: profile_id } } }

      expect do
        ActionCable.server.broadcast("profile:#{profile_id}", message)
      end.to have_broadcasted_to("profile:#{profile_id}").with(message)
    end
  end
end
