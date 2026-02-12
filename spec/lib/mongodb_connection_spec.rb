# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'MongoDB Connection' do
  it 'establishes connection to MongoDB' do
    expect(MONGO_CLIENT).to be_a(Mongo::Client)
  end

  it 'connects to the test database' do
    expect(MONGO_CLIENT.database.name).to eq('cg_test')
  end

  it 'can ping the database' do
    result = MONGO_CLIENT.database.command(ping: 1)
    expect(result.documents.first['ok']).to eq(1)
  end

  it 'makes $db global variable available' do
    expect($db).to be_a(Mongo::Client)
    expect($db).to eq(MONGO_CLIENT)
  end
end
