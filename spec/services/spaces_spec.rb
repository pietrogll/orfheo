describe 'get_public_info for Spaces' do

  let(:space_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:ambient_id){'fff01c94-4a2b-49ff-b6b6-dfd53e45bb81'}
  let(:otter_ambient_id){'eee01c94-4a2b-49ff-b6b6-dfd53e45bb82'}


  let(:ambient){
    {
      id: ambient_id,
      space_id: space_id
    }
  }

  let(:otter_ambient){
    {
      id: otter_ambient_id,
      space_id: space_id
    }
  }

  let(:profile){
    {
      id: profile_id,
      name: "profile_name",
      color: "profile_color"
    }
  }

  let(:space){
    {
      user_id: "user_i",
      profile_id: profile_id,
      id: space_id,
      name: "Space Name",
      type: "residential",
      address: {
        route: "calle",
        location: {
          lat: "39.4860405",
          lng: "-0.3609484000000001"
        }
      },
      description: "Space description",
      size: "",
      plane_picture: "",
      main_picture: [
        "picture.jpg"
      ],
      human_resources: "",
      materials: "",
      accessibility: "",
      rules: "",
      single_ambient: "true"
    }
  }
  
  before(:each){
    Repos::Spaces.save space
    Repos::Profiles.save profile
    [ambient, otter_ambient].each { |el| MetaRepos::Ambients.save el }
  }

  describe 'get_public_info' do

    let(:wanted_keys){ space.keys + [:profile_name, :profile_color] + [:ambients] - [:user_id]}

    it 'retrieves all the wanted_keys' do
      space = Services::DbElement.get_public_info :spaces, space_id
      
      expect( space.keys.sort ).to eq(wanted_keys.sort)
    end

    it 'retrieves the corresponding ambients' do
      space = Services::DbElement.get_public_info :spaces, space_id

      expect( space[:ambients] ).to eq([ambient, otter_ambient])
    end
  
  end

end