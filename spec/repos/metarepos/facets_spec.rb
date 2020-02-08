describe 'Facets Repo' do

  before(:each) {
    MetaRepos::Facets.clear
  }


  describe 'Modify' do
    
    xit 'updates an existing element' do

      MetaRepos::Facets.save ({
        facet: 'street-light',
        id: 'set_id'
      })

      MetaRepos::Facets.modify ({
        facet: 'incredible',
        id: 'set_id'
      })

      saved_facets = MetaRepos::Facets.all

      expect(saved_facets.length).to eq 1
      expect(saved_facets).to include hash_including(facet: 'incredible')
      expect(saved_facets).to include hash_including(id: 'set_id')
    end

    xit 'fails if the element does not exist' do

      MetaRepos::Facets.save ({
        facet: 'street-light',
        id: 'set_id'
      })

      MetaRepos::Facets.modify ({
        facet: 'incredible',
        id: 'otter_set_id'
      })

      saved_facets = MetaRepos::Facets.all

      expect(saved_facets.length).to eq 1
      expect(saved_facets).to include hash_including(facet: 'street-light')
      expect(saved_facets).to include hash_including(id: 'set_id')
    end

    xit 'gets the facet by filter' do
      MetaRepos::Facets.save ({
        facet: 'street-light',
        id: 'set_id'
      })

      MetaRepos::Facets.save ({
        facet: 'incredible',
        id: 'otter_set_id'
      })

      got_facet = MetaRepos::Facets.get(facet: 'street-light')

      expect(got_facet).to eq([{
        facet: 'street-light',
        id: 'set_id'
      }])

    end


  end

  
end