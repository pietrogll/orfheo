require 'rails_helper'

RSpec.describe Scopify, type: :controller do
  controller(ApplicationController) do
    scopify :event_id, :signature, :custom_param

    def test_action
      render json: {
        event_id: event_id,
        signature: signature,
        custom_param: custom_param
      }
    end
  end

  before do
    routes.draw do
      get 'test_action' => 'anonymous#test_action'
    end
  end

  describe '.scopify' do
    it 'creates accessor methods for specified parameters' do
      get :test_action, params: { event_id: '123', signature: 'abc', custom_param: 'test' }

      expect(JSON.parse(response.body)).to eq({
        'event_id' => '123',
        'signature' => 'abc',
        'custom_param' => 'test'
      })
    end

    it 'returns nil for missing parameters' do
      get :test_action

      response_body = JSON.parse(response.body)
      expect(response_body['event_id']).to be_nil
      expect(response_body['signature']).to be_nil
    end
  end
end
