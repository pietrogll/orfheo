# frozen_string_literal: true

# Simple Rails 8.1 compatibility test
require 'rails_helper'

RSpec.describe 'Rails 8.1 Compatibility' do
  it 'controllers have action_encoding_template method' do
    expect(EventsController).to respond_to(:action_encoding_template)
    result = EventsController.action_encoding_template(:any)
    expect(result).to be(false)
  end

  it 'can instantiate controller' do
    controller = EventsController.new
    expect(controller).to be_a(EventsController)
  end
end
