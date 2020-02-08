describe Repos::Productions do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}

  let(:production){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: production_id,
      category: 'category',
      title: 'title',
      description: 'description',
      short_description: 'short_description',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: [{link: 'web', web_title: 'web_name'},{link: 'otter_web', web_title: 'otter_web_name'}],
      duration: 'duration',
      children: 'children',
      cache: {value: 'cache', visible: false}
    }
  }

  before(:each){
    Repos::Productions.save production
  }

  describe 'Create and modify' do

    it 'registers a new production' do
      saved_entry = @db['productions'].find({id: production_id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'title' => 'title',
      })
    end

    it 'modifies a production' do
      production[:title] = 'otter_title'
      Repos::Productions.modify production
      saved_entry = @db['productions'].find({id: production_id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'title' => 'otter_title',
      })
    end
  end

  describe 'Exists?' do

    it 'checks for production existence' do
      expect(Repos::Productions.exists?('otter_production')).to eq(false)
      expect(Repos::Productions.exists?(production_id)).to eq(true)
    end
  end

  describe 'Getters' do

    it 'retrieves the owner of the production' do
      expect(Repos::Productions.get_owner production_id).to eq(user_id)
    end

    it 'retrieves the production' do
      expect(Repos::Productions.get_by_id production_id).to eq(production)
    end

    it 'retrieves the productions for a profile' do
      expect(Repos::Productions.get_profile_productions profile_id).to eq([production])
    end

    
  end

  describe 'Delete' do

    it 'deletes a production' do
      expect(Repos::Productions.exists?(production_id)).to eq(true)
      Repos::Productions.delete(production_id)
      expect(Repos::Productions.exists?(production_id)).to eq(false)
    end
  end
end
