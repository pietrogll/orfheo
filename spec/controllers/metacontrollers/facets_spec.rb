describe 'Facets controller' do

  before(:each) {
    MetaRepos::Facets.clear
  }

  xit 'lists all available facets' do
    facets = [
      { 'facet' => 'piano' },
      { 'facet' => 'street' },
      { 'facet' => 'soundlight' },
      { 'facet' => 'improvisation' }
    ]

    facets.each do |facet_hash|
      MetaRepos::Facets.save facet_hash
    end

    get '/facets/'

    expect(parsed_response['list'].length).to eq 4
    expect(parsed_response['list']).to match facets.map { |definition| hash_including(definition) }
  end


end
