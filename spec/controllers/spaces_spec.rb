describe SpacesController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:create_profile_route){'/users/create_profile'}
  let(:create_space_route){'/users/create_space'}
  let(:modify_space_route){'/users/modify_space'}
  let(:delete_space_route){'/users/delete_space'}


  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_user_id){'8c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_validation_code){'8c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:space_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:otter_space_id){'dddddbdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:ambient_id){'aaaa9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:otter_ambient_id){'aaaa9bdd-ecac-4237-9740-c8ae7a586000'}
  let(:other_ambient_id){'aaaa9bdd-ecac-4237-9740-c8ae7a586aaa'}
  let(:admin_id){'00000000-ecac-4237-9740-c8ae7a586000'}


  let(:admin){
    {
      id: admin_id
    }
  }

  let(:admin_user){
    {
      id: admin_id,
      email: 'admin@test.com',
      password: 'admin_passwd',
      validation: true,
      lang: 'es'
    }
  }


  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password'
    }
  }

  let(:otter_user_hash){
    {
      email: 'otter@otter.com',
      password: 'otter_password'
    }
  }

  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: false,
      validation_code: validation_code
    }
  }

  let(:otter_user){
    {
      id: otter_user_id,
      email: 'otter@otter.com',
      password: 'otter_password',
      validation: false,
      validation_code: otter_validation_code
    }
  }

  let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: ['artist'],
      tags: nil,
      name: 'name',
      email: {visible: 'false', value: "pippo@aol.com"},
      profile_picture: nil,
      address: {postal_code: '46020', locality: 'city'},
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

  let(:space){
    {
      profile_id: profile_id,
      id: space_id,
      name: 'space_name',
      address: 'address',
      description: 'description',
      size: "60",
      type: "space_type",
      plane_picture: ['plane.jpg'],
      main_picture: ['space.jpg'],
      human_resources:nil,
      materials: nil,
      accessibility: nil,
      rules: nil,
      single_ambient: 'false',
      ambients: [
        { 
          id: ambient_id,
          name: 'ambient_name',
          description: 'ambient_description',
          size: '40',
          tech_specs: nil,
          tech_poss: nil,
          height: nil,
          floor: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          photos: ['space.jpg','ambient.jpg'],
          links: [{'link'=> 'space_web', 'web_title'=> 'space_web_name'}]
        },
         { 
          id: otter_ambient_id,
          name: 'otter_ambient_name',
          description: 'otter_ambient_description',
          size: '20',
          tech_specs: nil,
          tech_poss: nil,
          height: nil,
          floor: nil,
          capacity: nil,
          allowed_categories: ['arts'],
          allowed_formats: ['concert','workshop'],  
          photos: ['otter.jpg','oro.jpg'],
          links: nil
        }
      ]
    }
  }


  let(:space_with_user){
    space.merge({user_id: user_id})
  }

  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    Repos::Users.save otter_user
    Repos::Users.validate otter_validation_code
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user_hash
    MetaRepos::Admins.save admin
    Repos::Users.save admin_user
    post create_profile_route, profile
  }

  describe 'Create space' do

    it 'fails if the profile does not exist' do
      space[:profile_id] = nil
      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if the address does not exist' do
      space[:address] = ''
      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if type does not exist' do
      space[:type] = ''
      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if ambients is blank' do
      space[:ambients] = []
      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if ambient name is blank' do
      space[:ambients] = [
        {
          name:'',
          description: 'ambient_description',
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop']  
          }
        ]
      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if ambient allowed_formats is blank' do
      space[:ambients] = [
        { 
          name: 'amb_name',
          description: 'ambient_description',
          allowed_categories: ['music','audiovisual'],
          allowed_formats: []  
          }
        ]

      post create_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'creates a space' do
      expect(Repos::Spaces).to receive(:save).with(space_with_user.except(:ambients))
      post create_space_route, space
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['space']).to include(Util.stringify_hash(space_with_user))
      expect(parsed_response['space']['gallery'].length).to eq(3)
    end
  end

  describe 'Modify space' do

    it 'fails if the space does not exist' do
      post modify_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_space')
    end

    it 'modifies a space' do
      post create_space_route, space
      space[:name] = 'otter_name'
      space_with_user[:name] = 'otter_name'
      expect(Repos::Spaces).to receive(:modify).with(space_with_user.except(:ambients))
      expect(MetaRepos::Ambients).to receive(:modify).twice
      post modify_space_route, space
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['space']).to include(Util.stringify_hash(space_with_user))
    end

    it 'modifies a space if admin' do
      post create_space_route, space
      post logout_route
      post login_route, admin_user
      space[:name] = 'otter_name'
      space_with_user[:name] = 'otter_name'
      expect(Repos::Spaces).to receive(:modify).with(space_with_user.except(:ambients))
      expect(MetaRepos::Ambients).to receive(:modify).twice
      post modify_space_route, space
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['space']).to include(Util.stringify_hash(space_with_user))
    end

    it 'does not allow to modify a space you don"t own' do
      post create_space_route, space
      post logout_route
      post login_route, otter_user_hash
      post modify_space_route, space
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('space_ownership')
    end
  end

  describe 'Delete' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
    }

    it 'fails if the space does not exist' do
      post delete_space_route, {id: space_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_space')
    end

    it 'fails if user does not own the space' do
      allow(SecureRandom).to receive(:uuid).and_return(space_id)
      post create_space_route, space
      post logout_route
      post login_route, otter_user_hash
      post delete_space_route, {id: space_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('space_ownership')
    end

    it 'deletes the space' do
      # allow(SecureRandom).to receive(:uuid).and_return(space_id)
      post create_space_route, space

      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['otter.jpg', 'oro.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['plane.jpg'])

      expect(Repos::Spaces).to receive(:delete).with(space_id).and_call_original
      expect(MetaRepos::Ambients).to receive(:delete).twice.and_call_original
      
      expect(Cloudinary::Api).to receive(:delete_resources).with(['otter.jpg', 'oro.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'ambient.jpg'])

      post delete_space_route, {id: space_id}
      expect(parsed_response['status']).to eq('success')

      post delete_space_route, {id: space_id}

      expect(MetaRepos::Ambients.get(profile_id: profile_id)).to eq  [] 

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_space')
    end
  end

  describe 'Gallery' do
    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      MetaRepos::Galleries.clear
      post create_space_route, space
    }

    it 'contains an element with the space plane_picture ' do
      expect(MetaRepos::Galleries.get(id: space_id)).to include hash_including({photos: ['plane.jpg']})
    end

    it 'contains an element for each ambient with links and photos' do
      expect(MetaRepos::Galleries.get(id: ambient_id)).to include hash_including({photos: ['space.jpg','ambient.jpg'],
                links: [{'link'=> 'space_web', 'web_title'=> 'space_web_name'}]})
      expect(MetaRepos::Galleries.get(id: otter_ambient_id)).to include hash_including({photos: ['otter.jpg','oro.jpg']})
    end

    it 'is modified when the space is modified' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(["plane.jpg"])
      allow(Cloudinary::Api).to receive(:delete_resources).with(["space.jpg", "ambient.jpg"])

      space[:plane_picture] = ['new_plane.jpg']
      space[:ambients].slice!(0)
      space[:ambients] << { 
          id: other_ambient_id,
          name: 'other_ambient_name',
          description: 'ambient_description',
          size: '40',
          tech_specs: nil,
          tech_poss: nil,
          height: nil,
          floor: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          photos: nil,
          links: [{'link'=> 'other_web'}]
        }

      post modify_space_route, space

      expect(MetaRepos::Galleries.get(id: space_id)).to include hash_including({photos: ['new_plane.jpg']})
      expect(MetaRepos::Galleries.get(id: other_ambient_id)).to include(hash_including({links: [{'link'=> 'other_web'}]}))
      expect(MetaRepos::Galleries.get(id: ambient_id)).to eq([])
    end

    it 'is deleted when the space is deleted' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['otter.jpg', 'oro.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['plane.jpg'])

      expect(MetaRepos::Galleries).to receive(:delete).exactly(3).times.and_call_original
      post delete_space_route, {id: space_id}
      expect(MetaRepos::Galleries.get(id: profile_id)).to eq([]) 
    end

  end


  describe 'Assets' do
    before(:each){
      MetaRepos::Assets.clear
      post create_space_route, space

    }

    it 'contains an element with the space plane_picture ' do
      expect(MetaRepos::Assets.get(url: 'plane.jpg').length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'plane.jpg')).to include(hash_including(holders:[space_id]))
    end

    it 'contains an element for each photo of the ambients' do
      expect(MetaRepos::Assets.get(url: 'space.jpg').length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'ambient.jpg').length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'space.jpg')).to include(hash_including(holders:[ambient_id]))
      expect(MetaRepos::Assets.get(url: 'otter.jpg').length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'oro.jpg').length).to eq(1)
    end

    it 'is modified when the space is modified' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(["plane.jpg"])
      allow(Cloudinary::Api).to receive(:delete_resources).with(["space.jpg", "ambient.jpg"])
       allow(Cloudinary::Api).to receive(:delete_resources).with(['otter.jpg','oro.jpg'])

      space[:plane_picture] = ['new_plane.jpg']
      
      space[:ambients] =[{ 
          id: other_ambient_id,
          name: 'other_ambient_name',
          description: 'ambient_description',
          size: '40',
          tech_specs: nil,
          tech_poss: nil,
          height: nil,
          floor: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          photos: ['a.jpg'],
          links: [{'link'=> 'other_web'}]
        }]

      post modify_space_route, space

      expect(MetaRepos::Assets.get(url: 'plane.jpg')).to eq []
      expect(MetaRepos::Assets.get(url: 'new_plane.jpg')).to include hash_including({holders: [space_id]})
      expect(MetaRepos::Assets.get(url: 'a.jpg')).to include hash_including({holders: [other_ambient_id]})
      expect(MetaRepos::Assets.all.length).to eq 2
    end

  end

end
