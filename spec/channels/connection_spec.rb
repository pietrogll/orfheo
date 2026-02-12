# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApplicationCable::Connection, type: :channel do
  describe '#connect' do
    context 'with authenticated session' do
      it 'successfully connects' do
        # Simulate authenticated session
        connect '/cable', session: { identity: 'user_123' }
        expect(connection.current_user_id).to eq('user_123')
      end
    end

    context 'without authenticated session' do
      it 'rejects connection' do
        expect do
          connect '/cable'
        end.to have_rejected_connection
      end
    end

    context 'with nil identity' do
      it 'rejects connection' do
        expect do
          connect '/cable', session: { identity: nil }
        end.to have_rejected_connection
      end
    end
  end
end
