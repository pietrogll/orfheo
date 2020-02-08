describe Repos::FreeBlocks do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:id){'096a9bdd-ecac-4237-9740-c8ae7a5864e5'}

  let(:free_block){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: id,
      name: 'name',
      description: 'description',
      photos: ['free_block.jpg'],
      links: [{link: 'free_block_web', web_title: 'free_block_web_name'}],
      buttons: [{link: "www.mywebsite.tld/my_promo.php", text: "Click here to get awesome stuff"}]
    }
  }

  before(:each){
    Repos::FreeBlocks.save free_block
  }

  describe 'Create and modify' do

    it 'registers a new free_block' do
      saved_entry = @db['free_blocks'].find({id: id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'name' => 'name',
      })
    end

    it 'modifies a free_block' do
      free_block[:name] = 'otter_name'
      Repos::FreeBlocks.modify free_block
      saved_entry = @db['free_blocks'].find({id: id}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'profile_id' => profile_id,
        'name' => 'otter_name',
      })
    end
  end

  describe 'Exists?' do

    it 'checks for free_block existence' do
      expect(Repos::FreeBlocks.exists?('otter_free_block')).to eq(false)
      expect(Repos::FreeBlocks.exists?(id)).to eq(true)
    end
  end

  describe 'Getters' do

    it 'retrieves the owner of the free_block' do
      expect(Repos::FreeBlocks.get_owner id).to eq(user_id)
    end

    it 'retrieves the free_block' do
      expect(Repos::FreeBlocks.get_by_id id).to eq(free_block)
    end

    it 'retrieves the free_blocks for a profile' do
      expect(Repos::FreeBlocks.get_profile_free_block profile_id).to eq(free_block)
    end
  end

  describe 'Delete' do

    it 'deletes a free_block' do
      expect(Repos::FreeBlocks.exists?(id)).to eq(true)
      Repos::FreeBlocks.delete(id)
      expect(Repos::FreeBlocks.exists?(id)).to eq(false)
    end
  end
end
