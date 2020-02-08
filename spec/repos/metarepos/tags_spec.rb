describe 'MetaRepos::Tags' do

  before(:each) {
    MetaRepos::Tags.clear
  }


  describe 'Modify' do
    
    it 'updates an existing element' do

      MetaRepos::Tags.save ({
        text: 'street-light',
        id: 'set_id',
        holders:['idp_1'],
        source: 'profile'
      })

      MetaRepos::Tags.modify ({
        # text: 'street-light',
        id: 'set_id',
        holders:['idp_1, idp_2'],
        # source: 'profile'
      })

      saved_tags = MetaRepos::Tags.all

      expect(saved_tags.length).to eq 1
      expect(saved_tags).to include hash_including(holders:['idp_1, idp_2'])
    end

    it 'fails if the element does not exist' do

      MetaRepos::Tags.save ({
        text: 'street-light',
        id: 'set_id',
        holders:['idp_1,idp_2'],
        source: 'profile'
      })

      MetaRepos::Tags.modify ({
        text: 'incredible',
        id: 'otter_set_id',
        source: 'profile',
        holders:['idp_1,idp_2']
      })

      saved_tags = MetaRepos::Tags.all

      expect(saved_tags.length).to eq 1
      expect(saved_tags).to include hash_including(text: 'street-light')
      expect(saved_tags).to include hash_including(id: 'set_id')
    end

    it 'gets the facet by filter' do
      MetaRepos::Tags.save ({
        text: 'street-light',
        id: 'set_id',
        holders:['idp_1,idp_2'],
        source: 'profile'
      })

      MetaRepos::Tags.save ({
        text: 'incredible',
        id: 'otter_set_id',
        source: 'profile'
      })

      got_facet = MetaRepos::Tags.get(text: 'street-light')

      expect(got_facet).to eq([{
        text: 'street-light',
        id: 'set_id',
        holders:['idp_1,idp_2'],
        source: 'profile'
      }])

    end


  end

  
end