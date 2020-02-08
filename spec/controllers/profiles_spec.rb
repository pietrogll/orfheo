describe ProfilesController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:create_profile_route){'/users/create_profile'}
  let(:create_production_route){'/users/create_production'}
  let(:create_space_route){'/users/create_space'}
  let(:delete_profile_route){'/users/delete_profile'}
  let(:delete_production_route){'/users/delete_production'}
  let(:delete_space_route){'/users/delete_space'}
  let(:create_free_blook_route){'/users/create_free_block'}
  let(:get_spaces_and_productions_route){'/users/profile_productions_spaces'}

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_user_id){'8c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_validation_code){'8c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_profile_id){'fde01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:space_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:otter_space_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e9'}
  let(:proposal_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:production_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:free_block_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e5'}
  let(:ambient_id){'aaaa9bdd-ecac-4237-9740-c8ae7a5864e5'}
  let(:otter_ambient_id){'bbba9bdd-ecac-4237-9740-c8ae7a5864e5'}
  let(:event_id){'000a9b00-ecac-4237-9740-c8ae7a5864e5'}
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

  let(:free_block){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: free_block_id,
      name: 'name',
      description: 'description',
      photos: ['free_block.jpg'],
      links: [{link: 'free_block_web', web_title: 'free_block_web_name'}],
      buttons: [{link: "www.mywebsite.tld/my_promo.php", text: "Click here to get awesome stuff"}]
    }
  }

  let(:production){
    {
      profile_id: profile_id,
      id: production_id,
      format: 'concert',
      category: 'music',
      main_picture: 'picture.jpg',  
      tags: nil,
      title: 'title',
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: nil,
      children: 'children',
      cache: 'cache'
    }
  }

  let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: ['artist'],
      tags: ['tag_1'],
      name: 'name',
      email: {'visible' => 'false', 'value' => "pippo@aol.com"},
      profile_picture: ['profile_picture.jpg'],
      address: {'postal_code' => '46020', 'locality' => 'city'},
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone:  { 'visible' => 'false', 'value' => 'phone'},
      buttons: [{'text' => 'text_button', 'link' => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []

    }
  }

  let(:space){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: space_id,
      name: 'space_name',
      type: "space_type",
      address: 'address',
      description: 'description',
      size: "60",
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
          floor: nil,
          height: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          links: [{'link'=> 'space_web', 'web_title'=> 'space_web_name'}],
          photos: ['space.jpg','ambient.jpg']
        },
        { 
          id: otter_ambient_id,
          name: 'otter_ambient_name',
          description: 'otter_ambient_description',
          size: '40',
          tech_specs: nil,
          tech_poss: nil,
          floor: nil,
          height: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          links: [{'link'=> 'space_web', 'web_title'=> 'space_web_name'}],
          photos: ['otter_ambient.jpg']
        }
      ]
    }
  }

  let(:otter_space){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: otter_space_id,
      name: 'otter_space_name',
      type: "space_type",
      address: 'address',
      description: 'description',
      size: "60",
      plane_picture: nil,
      main_picture: [],
      human_resources: nil,
      materials: nil,
      accessibility: nil,
      rules: nil,
      single_ambient:'true',
      ambients: [
        { 
          id: 'otter_profile_ambient_id',
          name: 'otter_profile_ambient',
          description: 'otter_profile_ambient_description',
          size: '4',
          tech_specs: nil,
          tech_poss: nil,
          floor: nil,
          height: nil,
          capacity: nil,
          allowed_categories: ['music','audiovisual'],
          allowed_formats: ['concert','workshop'],  
          links: nil,
          photos: nil
        }]
    }
  }

  let(:otter_profile){
    {
      id: otter_profile_id,
      phone: 'phone',
      name: 'otter_profile_name',
      facets: ['artist'],
      address: {'postal_code' => '33333', 'locality' => 'otter_city'},
      color: 'color',
      email: {'visible' => 'true', 'value' => 'otter@aol.com'}
    }
  }


  let(:custom_event){
    {
        id: event_id
    }
  } 


  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    Repos::Users.save otter_user
    Repos::Users.validate otter_validation_code
    Repos::Users.save admin_user
    MetaRepos::Admins.save admin
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user_hash
    # post login_route, admin_user  
  }

  describe 'Create' do

    it 'fails when one of the fundamental values is empty' do
      post create_profile_route, {
        name: 'name',
        address: 'address',
        email: nil,
        color: 'red'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails when address does not have postal_code or locality' do
      post create_profile_route, {
        name: 'name',
        address: {postal_code: '46020', locality:''},
        email: 'email',
        color: 'red'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails when email does not have correct format' do
      post create_profile_route, {
        name: 'name',
        address: {postal_code: '46020', locality:'city'},
        email: {visibility: 'false', value:'email@i'},
        color: 'red'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'creates a profile' do
      expect(Repos::Profiles).to receive(:save).with(hash_including(profile.except(:tags)))
      post create_profile_route, profile

      expected_profile = Util.stringify_hash(profile.reject{|k,_| k == :phone || k == :email || k == :tags})

      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profile']).to include(expected_profile)
    end

    it 'fails if user tries to create new profile with same name of other profile of his' do
      profile[:id] = nil
      post create_profile_route, profile
      expect(parsed_response['status']).to eq('success')
      post create_profile_route, profile
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_name')
    end

    it 'does not fail if the name is already taken by other user' do
      post create_profile_route, profile
      expect(parsed_response['status']).to eq('success')
      post logout_route
      post login_route, otter_user_hash
      post create_profile_route, profile
      expect(parsed_response['status']).to eq('success')
    end


    it 'adds relation to all profile of the same user' do
      post create_profile_route, profile
      post create_profile_route,  otter_profile
      got_profile = Repos::Profiles.get_by_id profile_id
      got_otter = Repos::Profiles.get_by_id otter_profile_id
      expect(got_profile[:relations]).to include({id: otter_profile_id, name: 'otter_profile_name', color:'color'})
      expect(got_otter[:relations]).to include({id: profile_id, name: 'name', color:'color'})
    end
  end

  describe 'Modify' do

    let(:modify_profile_route){'/users/modify_profile'}

    it 'fails if the profile does not exist' do
      post modify_profile_route, profile
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'does not allow to modify a profile you don"t own' do
      post create_profile_route, profile
      post logout_route
      post login_route, otter_user_hash
      post modify_profile_route, profile
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'modifies the desired parameters' do
      profile[:tags] = nil
      post create_profile_route, profile
      expect(Repos::Profiles).to receive(:modify).with(profile)
      post modify_profile_route, profile
      # expect(parsed_response['status']).to eq('fail')
      # expect(parsed_response['reason']).to eq(profile_id)
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profile']['id']).to eq(profile_id)
    end


    it 'modifies the desired parameters if admin' do
      profile[:tags] = nil
      post create_profile_route, profile
      post logout_route
      post login_route, admin_user

      expect(Repos::Profiles).to receive(:modify).with(profile)
      post modify_profile_route, profile
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profile']['id']).to eq(profile_id)
    end

    it 'fails if the name is already taken by other profile of the same user' do
      profile[:id] = nil
      post create_profile_route, profile
      post create_profile_route, otter_profile
      otter_profile[:name] = 'name'
      post modify_profile_route, otter_profile
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_name')
    end

    it 'updates profile name' do 
      post create_profile_route, profile
      post '/users/modify_profile_name', {id: profile_id, name: 'new_profile_name'}
      expect(parsed_response['status']).to eq('success')
      got_profile = Repos::Profiles.get_by_id profile_id
      profile[:name] = 'new_profile_name'
      expect(got_profile).to include(profile.except(:phone,:email,:buttons,:address, :tags))
    end


    it 'updates description' do 
      post create_profile_route, profile
      post '/users/modify_profile_description', {id: profile_id, description: 'new_profile_description'}
      expect(parsed_response['status']).to eq('success')
      got_profile = Repos::Profiles.get_by_id profile_id
      profile[:description] = 'new_profile_description'
      expect(got_profile).to include(profile.except(:phone,:email,:buttons,:address, :tags))
    end



  end

  describe 'Delete' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'plane.jpg','ambient.jpg', 'otter_ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
    }


    it 'deletes the profile and its elements' do
      
      post create_profile_route, profile
      post create_space_route, space
      post create_production_route, production
      post create_free_blook_route, free_block
      expect(MetaRepos::Assets.all.length).to eq(8)

      expect(Repos::Productions).to receive(:delete).with(production_id)
      expect(Repos::Spaces).to receive(:delete).with(space_id)
      expect(MetaRepos::Ambients).to receive(:delete).twice.and_call_original
      expect(MetaRepos::Galleries).to receive(:delete).at_least(3).times.and_call_original
      expect(Repos::FreeBlocks).to receive(:delete).with(free_block_id)
      expect(Repos::Profiles).to receive(:delete).with(profile_id)
      
      expect(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'ambient.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['otter_ambient.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['plane.jpg'])
      expect(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
      expect(Services::Profiles).to receive(:update_participations).with(profile_id)
      
      post delete_profile_route, {id: profile_id}
      expect(parsed_response['status']).to eq('success')    
      expect(Repos::Ambients.get(profile_id: profile_id)).to eq  []
      expect(Repos::Galleries.get(profile_id: profile_id)).to eq  []
      expect(MetaRepos::Assets.all.length).to eq(0)
      # expect(Repos::Galleries).to receive(:delete_profile).with(profile_id)
      # Services::Gallery.delete_profile profile_id
    end

    it 'fails if the profile does not exist' do
      post delete_profile_route, {profile_id: profile_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if user does not own the profile' do
      post create_profile_route, profile
      post logout_route
      post login_route, otter_user_hash
      post delete_profile_route, {id: profile_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'deletes the profile' do
      post create_profile_route, profile
      post delete_profile_route, {id: profile_id}
      expect(parsed_response['status']).to eq('success')
      post delete_profile_route, {id: profile_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'transforms profile to participant if profile owns events' do
      post create_profile_route, profile
      Repos::Events.save({id: 'event_id', profile_id: profile_id})
      expect(MetaRepos::Participants).to receive(:save).with(hash_including(id: profile_id))
      post delete_profile_route, {id: profile_id}
    end


    it 'update relations for profiles same user when profile deleted' do
      post create_profile_route, profile
      post create_profile_route,  otter_profile
      post delete_profile_route, {id: profile_id}
      got_otter = Repos::Profiles.get_by_id otter_profile_id
      expect(got_otter[:relations].empty?).to be(true)
    end

    it 'deletes calls of the profile' do
      post create_profile_route, profile
      Repos::Calls.save({id: 'call_id_1', profile_id: profile_id})
      Repos::Calls.save({id: 'call_id_2', profile_id: profile_id})
      expect(Actions::UserDeletesCall).to receive(:run).twice
      post delete_profile_route, {id: profile_id}
    end

  end

  describe 'Access' do

    let(:profiles_route){'/profile?id=' + profile_id}

    before(:each){
      post create_profile_route, profile
    }

    it 'redirects user to not found page if profile does not exist' do
      get '/profile?id=artist_name'
      expect(last_response.body).to include('Not Found')
    end

    it 'gets the profile with all info if owner or admin' do
      expect(Actions::VisitProfileAsOwner).to receive(:run).with(profile_id).and_return({})
      get profiles_route
    end

    it 'redirects user to profile page otherwise' do
      get profiles_route
      expect(last_response.body).to include('Pard.Profile')
    end

    it 'redirects user to profile page with reduced info if not the owner' do
      post logout_route
      expect(Actions::VisitProfile).to receive(:run).with(profile_id).and_call_original
      get profiles_route
    end

    it 'redirects user to profile page with reduced info if not the owner(2)' do
      post logout_route
      post login_route, otter_user_hash
      expect(Actions::VisitProfile).to receive(:run).with(profile_id).and_call_original
      get profiles_route
    end

    it 'redirects user to profile page with all info if admin' do
      post logout_route
      post login_route, admin_user
      expect(Actions::VisitProfileAsOwner).to receive(:run).with(profile_id).and_return({})
      get profiles_route
    end

  end

  describe 'Profile visited' do

    before(:each){
      post create_profile_route, profile
      post create_space_route, space
      post create_space_route, otter_space
      post create_production_route, production
      post create_free_blook_route, free_block
    }

    it 'contains the spaces of the profile' do
      got_profile = Actions::VisitProfileAsOwner.run(profile_id)
      expect(got_profile[:space]).to be_a(Array)
      expect(got_profile[:space].length).to eq 2
      expect(got_profile[:space]).to include(space, otter_space)
    end

    it 'contains the portfolio of the profile' do
      got_profile = Actions::VisitProfileAsOwner.run(profile_id)
      expect(got_profile[:portfolio]).to be_a(Hash)
      expect(got_profile[:portfolio][:proposals]).to include(hash_including(production))
    end

    it 'contains the free_block of the profile' do
      got_profile = Actions::VisitProfileAsOwner.run(profile_id)
      expect(got_profile[:free_block]).to be_a(Hash)
      expect(got_profile[:free_block]).to include(free_block)
    end

    it 'contains the gallery of the profile' do
      got_profile = Actions::VisitProfileAsOwner.run(profile_id)
      expect(got_profile[:gallery]).to be_a(Array)
      expect(got_profile[:gallery].length).to eq(6)
    end

    it 'contains the tags of the profile' do
      got_profile = Actions::VisitProfileAsOwner.run(profile_id)
      expect(got_profile[:tags]).to be_a(Array)
      expect(got_profile[:tags].length).to eq(1)
      expect(got_profile[:tags][0]).to eq('tag_1')
    end

  end

  describe 'profile_productions_spaces'do

    before(:each){
      Repos::Events.save(custom_event)
      post create_profile_route, profile
      post create_space_route, space
      post create_space_route, otter_space
      post create_production_route, production
    }

    it'Retrieves all the spaces and the producions of a profile' do
      
      post get_spaces_and_productions_route, {profile_id:profile_id}    
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['productions']).to include(hash_including(Util.stringify_hash(production)))
      expect(parsed_response['spaces']).to eq([Util.stringify_hash(space),Util.stringify_hash(otter_space)])
    end

    it 'includes submitted spaces in the event' do
      Repos::Spaceproposals.save({profile_id: profile_id, space_id: space_id, event_id: event_id})
      post get_spaces_and_productions_route, {profile_id:profile_id, event_id:event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['spaces']).to eq([Util.stringify_hash(space),Util.stringify_hash(otter_space)])
      expect(parsed_response['submitted_spaces']).to eq([space_id])
    end
  end

  describe 'List' do
    it 'Retrieves a list with the user profiles' do
      profile[:tags] = nil
      post create_profile_route, profile
      post '/users/list_profiles'
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profiles']).to eq([Util.stringify_hash(profile)])
    end
  end

  describe 'Gallery' do
    
    before(:each){
      MetaRepos::Galleries.clear
      post create_profile_route, profile
       allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'plane.jpg','ambient.jpg', 'otter_ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
    }

    it 'contains an element with the profile picture ' do
      expect(MetaRepos::Galleries.get(id: profile_id)).to include hash_including({photos: ['profile_picture.jpg']})
    end

    it 'is modified when the profile is modified' do
      profile[:profile_picture] = ['new_profile_picture.jpg']
      post '/users/modify_profile', profile

      expect(MetaRepos::Galleries.get(id: profile_id)).to include hash_including({photos: ['new_profile_picture.jpg']})
    end

    it 'is deleted when the profile is deleted' do
      expect(MetaRepos::Galleries).to receive(:delete).with(profile_id).and_call_original
      post delete_profile_route, {id: profile_id}
      expect(MetaRepos::Galleries.get(id: profile_id)).to eq([]) 
    end

  end

  describe 'Profile Tags' do
    
    before(:each){
      MetaRepos::Tags.clear
      allow(SecureRandom).to receive(:uuid).and_return(profile_id)
      post create_profile_route, profile
       allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'plane.jpg','ambient.jpg', 'otter_ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
    }

    it 'creates an element if new tag' do
      expect(MetaRepos::Tags.all).to include(hash_including(text: 'tag_1'))
    end

    it 'saves de id of the new tag' do
      expect(Repos::Profiles.get_by_id(profile_id)[:tags]).to include(profile_id)
    end

    it 'does not create new tag if already existing' do
      otter_profile[:tags] = profile[:tags]
      post create_profile_route, otter_profile
      expect(MetaRepos::Tags.all.length).to eq(1)
    end

    it 'creates only non existing tags and does not create new tag if already existing' do
      expect(MetaRepos::Tags.all.length).to eq(1)
      otter_profile[:tags] = profile[:tags].push('tag_2')
      post create_profile_route, otter_profile
      expect(MetaRepos::Tags.all.length).to eq(2)
      expect(MetaRepos::Tags.all).to include(hash_including(text: 'tag_1'))
      expect(MetaRepos::Tags.all).to include(hash_including(text: 'tag_2'))
    end

    it 'creates downcase tags' do
      otter_profile[:tags] = ['Música ÈlectRo']
      post create_profile_route, otter_profile
      expect(MetaRepos::Tags.all.length).to eq(2)
      expect(MetaRepos::Tags.all).to include(hash_including(text: 'música èlectro'))
    end

    it 'adds the holder to an existing tag' do
      otter_profile[:tags] = profile[:tags]
      post create_profile_route, otter_profile
      expect(MetaRepos::Tags.all.length).to eq(1)
      expect(MetaRepos::Tags.all).to include(hash_including(holders: [profile_id, otter_profile_id]))
    end

    it 'removes the holder to an existing tag when profile modified' do
      otter_profile[:tags] = profile[:tags]
      post create_profile_route, otter_profile
      profile[:tags] = nil
      post '/users/modify_profile', profile
      expect(MetaRepos::Tags.all.length).to eq(1)
      expect(MetaRepos::Tags.all).to include(hash_including(holders: [otter_profile_id]))
    end

    it 'removes the holder to an existing tag when profile deleted' do
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      otter_profile[:tags] = profile[:tags]
      post create_profile_route, otter_profile
      post delete_profile_route, profile
      expect(MetaRepos::Tags.all.length).to eq(1)
      expect(MetaRepos::Tags.all).to include(hash_including(holders: [otter_profile_id]))
    end

    it 'deletes the tag if there are no holders' do 
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      post delete_profile_route, profile
      expect(MetaRepos::Tags.all.length).to eq(0)
    end

  end


  describe 'Assets' do
    before(:each){
      MetaRepos::Assets.clear
      post create_profile_route, profile
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['space.jpg', 'plane.jpg','ambient.jpg', 'otter_ambient.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
    }

    it 'contains an element with the profile_picture ' do
      expect(MetaRepos::Assets.get(url: 'profile_picture.jpg').length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'profile_picture.jpg')).to include(hash_including(holders:[profile_id]))
    end

    it 'is deleted when the profile_picture is deleted from the profile' do
      profile[:profile_picture] = nil
      post '/users/modify_profile', profile
      expect(MetaRepos::Assets.count).to eq(0)
    end

  end


end
