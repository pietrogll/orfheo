describe ProductionsController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:create_profile_route){'/users/create_profile'}
  let(:create_production_route){'/users/create_production'}
  let(:modify_production_route){'/users/modify_production'}
  let(:delete_production_route){'/users/delete_production'}
  let(:public_info){'/search/public_info'}


  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_user_id){'8c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_validation_code){'8c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:unexisting_production_id){'acea1c9a-4a2a-a9af-b6b6-dfd53e45bb80'}
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

  let(:production){
    {
      profile_id: profile_id,
      id: production_id,
      format: 'concert',
      category: 'music',
      main_picture: 'picture.jpg',  
      tags: ['production_tag1', 'production_tag2'],
      title: 'title',
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: [{'link'=> 'web', 'web_title'=> 'web_name'},{'link'=> 'otter_web', 'web_title'=> 'otter_web_name'}],
      children: 'children',
      cache: 'cache'
    }
  }

  let(:production_with_user){
    production.merge(user_id: user_id)
  }

  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    Repos::Users.save otter_user
    Repos::Users.validate otter_validation_code
    Repos::Profiles.save profile
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user_hash
    MetaRepos::Admins.save admin
    Repos::Users.save admin_user
  }

  describe 'Create' do

    it 'fails if the profile does not exist' do
      production[:profile_id] = nil
      post create_production_route, production
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if the category does not exist' do
      production[:category] = 'otter'
      post create_production_route, production
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_category')
    end

    it 'creates a production' do
      production[:tags] = nil
      production_with_user[:tags] = nil
      expect(Repos::Productions).to receive(:save).with(production_with_user)
      post create_production_route, production
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['production']).to include(Util.stringify_hash(production_with_user))
    end
  end

  describe 'Modify productions' do

    it 'fails if the production does not exist' do
      post modify_production_route, production
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_production')
    end

    it 'modifies a production' do
      production[:tags] = nil
      production_with_user[:tags] = nil
      post create_production_route, production
      production[:title] = 'otter_title'
      production_with_user[:title] = 'otter_title'
      expect(Repos::Productions).to receive(:modify).with(production_with_user)
      post modify_production_route, production
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['production']).to include(Util.stringify_hash(production_with_user))
    end

    it 'modifies a production if admin' do
      production[:tags] = nil
      production_with_user[:tags] = nil
      post create_production_route, production
      post logout_route
      post login_route, admin_user
      production[:title] = 'otter_title'
      production_with_user[:title] = 'otter_title'
      expect(Repos::Productions).to receive(:modify).with(production_with_user)
      post modify_production_route, production
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['production']).to include(Util.stringify_hash(production_with_user))
    end

    it "does not allow to modify a production you don't own" do
      post create_profile_route, profile
      post create_production_route, production
      post logout_route
      post login_route, otter_user_hash
      post modify_production_route, production
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end
  end

  describe 'Delete' do

    it 'fails if the production does not exist' do
      post create_profile_route, profile
      post delete_production_route, {id: production_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_production')
    end

    it 'fails if user does not own the production' do
      post create_profile_route, profile
      allow(SecureRandom).to receive(:uuid).and_return(production_id)
      post create_production_route, production
      post logout_route
      post login_route, otter_user_hash
      post delete_production_route, {id: production_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'deletes the production' do
      post create_profile_route, profile
      allow(SecureRandom).to receive(:uuid).and_return(production_id)
      post create_production_route, production

      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      expect(Repos::Productions).to receive(:delete).with(production_id).and_call_original

      post delete_production_route, {id: production_id}
      expect(parsed_response['status']).to eq('success')

      post delete_production_route, {id: production_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_production')
    end
  end

  describe 'Gallery' do
    before(:each){
      MetaRepos::Galleries.clear
      post create_production_route, production
    }

    it 'contains an element with the free_block picture ' do
      expect(MetaRepos::Galleries.get(id: production_id)).to include hash_including({photos: ['picture.jpg', 'otter_picture.jpg']})
    end


    it 'is modified when the production is modified' do

      allow(SecureRandom).to receive(:uuid)
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      
      production[:photos] = ['new_production_picture.jpg']
      production[:links] = [{'link'=> 'other_web'}]

      post modify_production_route, production

      expect(MetaRepos::Galleries.get(id: production_id)).to include hash_including({photos: ['new_production_picture.jpg']})
      expect(MetaRepos::Galleries.get(id: production_id)).to include hash_including({links: [{'link'=> 'other_web'}]})
    
    end

    it 'is deleted when the production is deleted' do

      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])

      expect(MetaRepos::Galleries).to receive(:delete).with(production_id).and_call_original
      post delete_production_route, {id: production_id}
      expect(MetaRepos::Galleries.get(id: profile_id)).to eq([]) 
    end

  end

  describe 'Production Tags' do
    
    before(:each){
      MetaRepos::Tags.clear

    }

    it 'creates an element if new tag' do
      post create_production_route, production
      expect(MetaRepos::Tags.all).to include(hash_including(text: 'production_tag1'))
      expect(MetaRepos::Tags.all).to include(hash_including(source: 'productions'))
    end

    it 'saves the id of the new tag' do
      allow(SecureRandom).to receive(:uuid).and_return(profile_id)
      post create_production_route, production
      post create_profile_route, profile
      expect(Repos::Productions.get_by_id(production_id)[:tags]).to include(profile_id)
    end

    it 'does not create new tag if text already existing but adds holder' do
      MetaRepos::Tags.save({id: 'id_t1', text: 'production_tag1', holders: ['prod_1_id'], source: 'productions'})
      production[:tags] = ['production_tag1']
      post create_production_route, production
      expect(MetaRepos::Tags.all).to eq([{id: 'id_t1', text: 'production_tag1', source: "productions", holders: ['prod_1_id', production_id]}])
    end

    it 'does not create new tag if id already existing but adds holder' do
      MetaRepos::Tags.save({id: 'id_t1', text: 'production_tag1', holders: ['prod_1_id'], source: 'productions'})
      production[:tags] = ['id_t1']
      post create_production_route, production
      expect(MetaRepos::Tags.all).to eq([{id: 'id_t1', text: 'production_tag1', source: "productions", holders: ['prod_1_id', production_id]}])
    end


    it 'removes the holder to an existing tag when production modified' do
      production[:tags] = ['id_t1', 'id_t2']
      MetaRepos::Tags.save({id: 'id_t1', text: 'production_tag1', holders: ['prod_1_id', production_id], source: 'productions'})
      MetaRepos::Tags.save({id: 'id_t2', text: 'production_tag2', holders: [production_id], source: 'productions'})
      post create_production_route, production     
      expect(MetaRepos::Tags.all.length).to eq(2)
      production[:tags] = nil
      post modify_production_route, production
      expect(MetaRepos::Tags.all.length).to eq(1)
      expect(MetaRepos::Tags.all).to eq([{:id=>"id_t1", :text=>"production_tag1", :source=>"productions", :holders=>["prod_1_id"]}])
    end

    it 'removes the holder to an existing tag when production deleted' do
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      production[:tags] = ['id_t1', 'id_t2']
      MetaRepos::Tags.save({id: 'id_t1', text: 'production_tag1', holders: ['prod_1_id', production_id], source: 'productions'})
      MetaRepos::Tags.save({id: 'id_t2', text: 'production_tag2', holders: [production_id], source: 'productions'})
      post create_production_route, production     
      expect(MetaRepos::Tags.all.length).to eq(2)
      post delete_production_route, production
      expect(MetaRepos::Tags.all.length).to eq(1)
      expect(MetaRepos::Tags.all).to eq([{:id=>"id_t1", :text=>"production_tag1", :source=>"productions", :holders=>["prod_1_id"]}])
    end

    it 'deletes the tag if there are no holders' do
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg']) 
      production[:tags] = ['id_t1', 'id_t2']
      MetaRepos::Tags.save({id: 'id_t1', text: 'production_tag1', holders: [production_id], source: 'productions'})
      MetaRepos::Tags.save({id: 'id_t2', text: 'production_tag2', holders: [production_id], source: 'productions'})
      post create_production_route, production     
      post delete_production_route, production
      expect(MetaRepos::Tags.all.length).to eq(0)
    end

  end

  describe 'Assets' do
    before(:each){
      MetaRepos::Galleries.clear
      post create_production_route, production
    }

    it 'contains an element for each production pictures ' do
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'picture.jpg')).to include(hash_including(holders:[production_id]))
    end

    it 'is eliminated if production deleted' do
      expect(MetaRepos::Assets.all.length).to eq(2)
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      post delete_production_route, production
      expect(MetaRepos::Assets.all.length).to eq(0)
    end

    it 'is updated if production modified' do
      expect(MetaRepos::Assets.all.length).to eq(2)
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg'])
      production[:photos] = ['otter_picture.jpg','new_picture.jpg', 'other_picture.jpg']
      post modify_production_route, production
      expect(MetaRepos::Assets.get(url: 'picture.jpg')).to eq([])
      expect(MetaRepos::Assets.get(url: 'otter_picture.jpg')).to include(hash_including(holders:[production_id]))
      # expect(MetaRepos::Assets.get(url: 'other_picture.jpg')).to include(hash_including(holders:[production_id]))
      expect(MetaRepos::Assets.all.length).to eq(3)

    end


  end

  describe 'get production info' do

    before(:each){
      Repos::Productions.save production
    }
    
    it 'fails if element does not exist' do
      get public_info, {id: unexisting_production_id, db_key: 'productions'}
      expect(parsed_response['status']).to eq('fail')
    end

    it 'returns the corresponding production' do
      expected_result = production.except(:main_picture)
      expected_result[:cache] = nil
      expected_result[:tags] = []
      expected_result[:profile_name] = 'name'
      expected_result[:profile_color] = 'color'

      get public_info, {id: production_id, db_key: 'productions'}
            
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['db_element']).to eq(Util.stringify_hash(expected_result))
    end

  end


end
