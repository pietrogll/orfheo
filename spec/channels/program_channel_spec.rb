# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ProgramChannel, type: :channel do
  let(:program_id) { '87654321-4321-4321-4321-cba987654321' }
  let(:user_signature) { 'test@example.com' }

  before do
    stub_connection(current_user_signature: user_signature)
  end

  describe '#subscribed' do
    it 'subscribes to the program stream' do
      subscribe(program_id: program_id)

      expect(subscription).to be_confirmed
      expect(subscription).to have_stream_from("program:#{program_id}")
    end

    it 'does not subscribe without program_id' do
      subscribe(program_id: nil)

      expect(subscription).to be_confirmed
      expect(subscription).not_to have_stream_from("program:")
    end
  end

  describe '#unsubscribed' do
    it 'stops all streams when unsubscribed' do
      subscribe(program_id: program_id)
      expect(subscription).to be_confirmed

      unsubscribe
      expect(subscription).not_to have_streams
    end
  end

  describe 'broadcasting' do
    it 'receives broadcasted messages' do
      subscribe(program_id: program_id)

      message = { status: 'success', data: { event: 'program_updated', model: { id: program_id } } }

      expect {
        ActionCable.server.broadcast("program:#{program_id}", message)
      }.to have_broadcasted_to("program:#{program_id}").with(message)
    end
  end
end
