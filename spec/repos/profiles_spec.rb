describe Repos::Profiles do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: nil,
      tags: nil,
      name: 'name',
      email: {visible: 'false', value: "pippo@aol.com"},
      profile_picture: nil,
      address: 'address',
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone: { visible: 'false', value: 'phone'},
      buttons: nil,
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ] 

    }
  }

  before(:each){
    Repos::Profiles.save profile
  }

  describe 'Create and modify' do

    it 'registers a new profile' do
      saved_entry = @db['profiles'].find({}).first
      expect(saved_entry).to include({
        'user_id' => user_id,
        'id' => profile_id,
        'name' => 'name',
        'phone' => {'visible' => 'false', 'value' => "phone"},
        'email' => {'visible' => 'false', 'value' => "pippo@aol.com"},
        'menu' => [ "free_block", "upcoming", "space", "description", "portfolio", "history"]
      })
    end

    it 'modifies a parameter' do
      Repos::Profiles.modify({id: profile_id, name: 'otter_name', pippo: 'pippo'})
      saved_entry = @db['profiles'].find({id: profile_id}).first
      expect(saved_entry).to include({
        'id' => profile_id,
        'name' => 'otter_name',
        'pippo' => 'pippo'
      })
    end

    it 'checks if a name is available' do
      expect(Repos::Profiles.name_available? 'otter_id', 'name').to eq(true)
      expect(Repos::Profiles.name_available? user_id, 'name').to eq(false)
    end
  end

  describe 'Get Profiles' do

    let(:my_otter_profile){
      profile.merge({
        user_id: user_id,
        id: 'my_otter_profile_id',
        name: 'otter_name',
        phone: {value: 'otter_phone', visible: 'true'}
      })
    }

    let(:otter_user_profile){
      profile.merge({
        user_id: 'otter_user',
        id: 'otter_user_profile_id',
        name: 'otter_user_name',
        phone: {value: 'otter_user_tel', visible: 'false'}
      })
    }

    let(:call){
      {
        participants: [profile_id, 'otter_user_profile_id']
      }
    }

    before(:each){
      Repos::Profiles.save(my_otter_profile)
      Repos::Profiles.save(otter_user_profile)
    }

    it 'returns a specific profile' do
      result = Repos::Profiles.get_by_id profile_id
      expect(result).to eq(profile)
    end


    it 'returns all profiles and those of the user (sorted)' do
      result = Repos::Profiles.get_user_profiles user_id
      expect(result).to include(profile, my_otter_profile)
    end

    it 'returns all profiles participants to the call for an event if the program not published' do
      allow(Repos::Calls).to receive(:get).with({event_id: 'event_id'}).and_return([call])
      result = Repos::Profiles.get_event_profiles 'event_id'
      expect(result).to include(profile, otter_user_profile)
    end

    it 'returns all profiles participants to the program if the program published' do
      Repos::Programs.save({id: 'program_id', event_id: 'event_id', participants: [profile_id], published: true})
      result = Repos::Profiles.get_event_profiles 'event_id'
      expect(result).to eq [profile]
    end

  end

  describe 'Get_owner' do

    it 'retrieves the owner of the profile' do
      expect(Repos::Profiles.get_owner profile_id).to eq(user_id)
    end
  end

  describe 'Delete' do

    it 'deletes a profile' do
      expect(Repos::Profiles.exists?(profile_id)).to eq(true)
      Repos::Profiles.delete profile_id
      expect(Repos::Profiles.exists?(profile_id)).to eq(false)
    end
  end

end
