describe 'Galleries controller' do


  let(:login_route){'/login/login'}
  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:gallery_id){'5c41cf77-32b0-4df2-9376-0960e64a6577'}
  let(:otter_gallery_id){'5c41cf77-32b0-4df2-9376-0960e64a6500'}

  let(:gallery_element){
    {
      profile_id: profile_id,
      source: 'src', 
      name:'name', 
      links:[],
      photos:['picture.jpg']
    }
  }

  let(:gallery_element_2){
    {
      profile_id: profile_id,
      source: 'src_2', 
      name:'name_2', 
      links:[],
      photos:['picture_2.jpg']
    }
  }

  let(:gallery_otter_element){
    {
      profile_id: 'otter_id',
      source: 'o_src', 
      name:'o_name', 
      links:[],
      photos:['0_picture.jpg']
    }
  }

  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password'
    }
  }

  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: true
    }
  }  


  before(:each) {
    MetaRepos::Galleries.clear
    Repos::Users.save user
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)

    post login_route, user_hash
    Repos::Profiles.save ({
      user_id: user_id,
      id: profile_id
      })
  }

  it 'can store an element of a gallery' do
    post '/galleries/', gallery_element

    expect(MetaRepos::Galleries.count).to eq 1
    expect(MetaRepos::Galleries.all).to include hash_including({
      profile_id: profile_id
      # source: 'src', 
      # name:'name', 
      # links:[],
      # photos:['picture.jpg']
    })
  end

  it 'lists elements of the gallery of a specific profile' do
    MetaRepos::Galleries.save gallery_element
    MetaRepos::Galleries.save gallery_otter_element
    MetaRepos::Galleries.save gallery_element_2

    get '/galleries/by_profile_id/fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'

    expect(parsed_response['list'].length).to eq 2
    expect(parsed_response['list']).to include hash_including({'source' => 'src', 'profile_id' => profile_id})

  end


  describe 'id' do
    it 'is added when missing' do
      post '/galleries/', gallery_element

      saved_galleries = MetaRepos::Galleries.all

      expect(saved_galleries.length).to eq 1
      expect(saved_galleries).to include hash_including({source: 'src'})
      expect(saved_galleries).to include hash_including(:id)
    end

    it 'is kept when set' do
      post '/galleries/', {
        id: gallery_id,
        source: 'src',
        profile_id: profile_id
      }

      saved_galleries = MetaRepos::Galleries.all

      expect(saved_galleries.length).to eq 1
      expect(saved_galleries).to include hash_including(source: 'src')
      expect(saved_galleries).to include hash_including(id: gallery_id)
    end

  end

  describe 'Modify' do

    it 'updates the element with the same id' do
      post '/galleries/', {
        profile_id: profile_id,
        source: 'src',
        id: gallery_id,
        user_id: user_id
      }

      post '/galleries/modify', {
        profile_id: profile_id,
        source: 'src_modified',
        id: gallery_id,
        user_id: user_id
      }

      saved_galleries = MetaRepos::Galleries.all

      expect(saved_galleries.length).to eq 1
      expect(saved_galleries).to include hash_including(source: 'src_modified')
      expect(saved_galleries).to include hash_including(id: gallery_id)
    end

    it 'fails if there is no element with the id' do
      MetaRepos::Galleries.save ({
        profile_id: profile_id,
        source: 'src',
        id: gallery_id,
        user_id: user_id
      })
      post '/galleries/modify', {
        profile_id: profile_id,
        source: 'src',
        id: otter_gallery_id,
        user_id: user_id
      }
      expect(parsed_response['status']).to eq('fail')
    end

    it 'fails when user is not the owner' do
      MetaRepos::Galleries.save ({
        profile_id: profile_id,
        source: 'src',
        id: gallery_id,
        user_id: user_id
      })

      post '/galleries/modify', {
        profile_id: profile_id,
        source: 'src',
        id: otter_gallery_id,
        user_id: user_id
      }

      expect(parsed_response['status']).to eq('fail')
    end

  end



  
  
end
