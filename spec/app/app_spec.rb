describe RSpec do
  it 'works' do
    expect(true).to eq true
  end
end

describe Sinatra do
  it 'works' do
    get '/'
    expect(last_response.ok?).to be true
  end
end
