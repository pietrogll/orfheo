describe 'get_public_info for Productions' do

  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:tag_id){'fff01c94-4a2b-49ff-b6b6-dfd53e45bb81'}
  let(:otter_tag_id){'eee01c94-4a2b-49ff-b6b6-dfd53e45bb82'}
  let(:other_tag_id){'ccc01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:tag){
    {
      id: tag_id,
      text: "tag_text",
      source: "production",
      holders: [production_id]
    }
  }

  let(:otter_tag){
    {
      id: otter_tag_id,
      text: "otter_tag_text",
      source: "production",
      holders: [production_id]
    }
  }

  let(:other_tag){
    {
      id: other_tag_id,
      text: "other_tag_text",
      source: "production",
      holders: [production_id]
    }
  }

  let(:profile){
    {
      id: profile_id,
      name: "profile_name",
      color: "profile_color"
    }
  }

  let(:production){
    {
      profile_id: profile_id,
      user_id: 'user_id',
      id: production_id,
      format: 'concert',
      category: 'music',
      main_picture: ['picture.jpg'],  
      title: 'title',
      tags: [tag_id, otter_tag_id, other_tag_id],
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: nil,
      children: 'family',
      cache: {:value=>100, :visible=>true, :comment=>nil}
    }
  }
  
  before(:each){
    Repos::Productions.save production
    Repos::Profiles.save profile
    [tag, otter_tag, other_tag].each { |el| MetaRepos::Tags.save el }
  }

  describe 'get_public_info' do

    let(:wanted_keys){ [:profile_id, :id, :format, :category, :title, :tags, :description, :short_description, :duration, :photos, :links, :children, :cache, :profile_name, :profile_color] }

    it 'retrieves all the wanted_keys' do
      production = Services::DbElement.get_public_info :productions, production_id
      
      expect( production.keys.sort ).to eq(wanted_keys.sort)
    end

    it 'retrieves the corresponding tags' do
      production = Services::DbElement.get_public_info :productions, production_id

      expect( production[:tags] ).to eq([tag[:text], otter_tag[:text], other_tag[:text]])
    end

    it 'filters the sensible fields of the production' do
      Repos::Productions.modify({
        id: production_id, 
        cache: {visible: false} 
      })
      production = Services::DbElement.get_public_info :productions, production_id

      expect( production[:cache] ).to eq nil
    end
  
  end

end