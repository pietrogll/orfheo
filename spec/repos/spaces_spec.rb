describe Repos::Spaces do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:id){'096a9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:otter_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e9'}

  let(:space){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: id,
      name: 'name',
      category: 'home',
      description: 'description',
      photos: ['space.jpg'],
      links: [{link: 'space_web', web_title: 'space_web_name'}],
    }
  }

  let(:otter_space){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: otter_id,
      name: 'otter_space',
      category: 'commercial',
      description: 'otter_description',
      photos: ['space.jpg'],
      links: [{link: 'space_web', web_title: 'space_web_name'}],
    }
  }

  before(:each){
    Repos::Spaces.save space
    Repos::Spaces.save otter_space
  }

  describe 'Create and modify' do

    it 'registers a new space' do
      saved_entry = @db['spaces'].find({id: id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'name' => 'name',
      })
    end

    it 'modifies a space' do
      space[:name] = 'otter_name'
      Repos::Spaces.modify space
      saved_entry = @db['spaces'].find({id: id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'name' => 'otter_name',
      })
    end
  end

  describe 'Exists?' do

    it 'checks for space existence' do
      expect(Repos::Spaces.exists?('otter_space')).to eq(false)
      expect(Repos::Spaces.exists?(id)).to eq(true)
    end
  end

  describe 'Getters' do

    it 'retrieves the owner of the space' do
      expect(Repos::Spaces.get_owner id).to eq(user_id)
    end

    it 'retrieves the space' do
      expect(Repos::Spaces.get_by_id id).to eq(space)
    end

    # it 'retrieves the spaces for a profile' do
    #   expect(Repos::Spaces.get_profile_space profile_id).to eq(space)
    # end

    it 'retrieves all the spaces of the profile' do
      expect(Repos::Spaces.get_all_profile_spaces profile_id).to include(space, otter_space)
    end

  end

  describe 'Delete' do

    it 'deletes a space' do
      expect(Repos::Spaces.exists?(id)).to eq(true)
      Repos::Spaces.delete(id)
      expect(Repos::Spaces.exists?(id)).to eq(false)
    end
  end
end
