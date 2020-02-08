describe FreeBlocksController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:create_profile_route){'/users/create_profile'}
  let(:create_free_block_route){'/users/create_free_block'}
  let(:modify_free_block_route){'/users/modify_free_block'}
  let(:delete_free_block_route){'/users/delete_free_block'}


  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_user_id){'8c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_validation_code){'8c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:free_block_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e4'}
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

  let(:free_block){
    {
      profile_id: profile_id,
      id: free_block_id,
      name: 'name',
      description: 'description',
      links: [{'link'=> 'free_block_web', 'web_title'=> 'free_block_web_name'}],
      photos: ['free_block.jpg'],
      buttons: nil
    }
  }

  let(:free_block_with_user){
    free_block.merge({user_id: user_id})
  }

  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    Repos::Users.save otter_user
    Repos::Users.validate otter_validation_code
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user_hash
    allow(SecureRandom).to receive(:uuid).and_return(profile_id)
    post create_profile_route, profile
    # Repos::Users.save admin_user
    post create_profile_route, profile
    MetaRepos::Admins.save admin
    Repos::Users.save admin_user
  }

  describe 'Create free_block' do

    it 'fails if the profile does not exist' do
      free_block[:profile_id] = nil
      post create_free_block_route, free_block
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if the name does not exist' do
      free_block[:name] = ''
      post create_free_block_route, free_block
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'creates a free_block' do
      expect(Repos::FreeBlocks).to receive(:save).with(free_block_with_user)
      post create_free_block_route, free_block
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['free_block']).to include(Util.stringify_hash(free_block_with_user))
    end
  end

  describe 'Modify free_block' do

    it 'fails if the free_block does not exist' do
      post modify_free_block_route, free_block
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_free_block')
    end

    it 'modifies a free_block' do
      post create_free_block_route, free_block
      free_block[:name] = 'otter_name'
      free_block_with_user[:name] = 'otter_name'
      expect(Repos::FreeBlocks).to receive(:modify).with(free_block_with_user)
      post modify_free_block_route, free_block
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['free_block']).to include(Util.stringify_hash(free_block_with_user))
    end


    it 'modifies a free_block if admin' do
      post create_free_block_route, free_block
      post logout_route
      post login_route, admin_user
      free_block[:name] = 'otter_name'
      free_block_with_user[:name] = 'otter_name'
      expect(Repos::FreeBlocks).to receive(:modify).with(free_block_with_user)
      post modify_free_block_route, free_block
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['free_block']).to include(Util.stringify_hash(free_block_with_user))
    end

    it 'does not allow to modify a free_block you don"t own' do
      post create_free_block_route, free_block
      post logout_route
      post login_route, otter_user_hash
      post modify_free_block_route, free_block
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('free_block_ownership')
    end
  end

  describe 'Delete' do

    it 'fails if the free_block does not exist' do
      post delete_free_block_route, {id: free_block_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_free_block')
    end

    it 'fails if user does not own the free_block' do
      allow(SecureRandom).to receive(:uuid).and_return(free_block_id)
      post create_free_block_route, free_block
      post logout_route
      post login_route, otter_user_hash
      post delete_free_block_route, {id: free_block_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('free_block_ownership')
    end

    it 'deletes the free_block' do
      allow(SecureRandom).to receive(:uuid).and_return(free_block_id)
      post create_free_block_route, free_block

      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
      expect(Repos::FreeBlocks).to receive(:delete).with(free_block_id).and_call_original

      post delete_free_block_route, {id: free_block_id}
      expect(parsed_response['status']).to eq('success')

      post delete_free_block_route, {id: free_block_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_free_block')
    end
  end

  describe 'Gallery' do
    before(:each){
      MetaRepos::Galleries.clear
      post create_free_block_route, free_block
    }

    it 'contains an element with the free_block picture ' do
      expect(MetaRepos::Galleries.get(id: free_block_id)).to include hash_including({photos: ['free_block.jpg']})
    end


    it 'is modified when the free_block is modified' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])
      
      free_block[:photos] = ['new_free_block.jpg']
      free_block[:links] = [{'link'=> 'other_web'}]

      post modify_free_block_route, free_block

      expect(MetaRepos::Galleries.get(id: free_block_id)).to include hash_including({photos: ['new_free_block.jpg']})
      expect(MetaRepos::Galleries.get(id: free_block_id)).to include hash_including({links: [{'link'=> 'other_web'}]})
    
    end

    it 'is deleted when the free_block is deleted' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(['free_block.jpg'])

      expect(MetaRepos::Galleries).to receive(:delete).with(free_block_id).and_call_original
      post delete_free_block_route, {id: free_block_id}
      expect(MetaRepos::Galleries.get(id: profile_id)).to eq([]) 
    end

  end


  describe 'Assets' do
    before(:each){
      MetaRepos::Galleries.clear
      post create_free_block_route, free_block
    }

    it 'contains an element for each production pictures ' do
      expect(MetaRepos::Assets.all.length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'free_block.jpg')).to include(hash_including(holders:[free_block_id]))
    end

  end


end
