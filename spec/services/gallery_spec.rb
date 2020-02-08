describe Services::Gallery do


  let(:login_route){'/login/login'}
  let(:create_profile_route){'/users/create_profile'}
  let(:create_production_route){'/users/create_production'}
  let(:create_space_route){'/users/create_space'}
  let(:create_free_blook_route){'/users/create_free_block'}



  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:space_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:free_block_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e4'}



  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: true
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

  before(:each){
    Repos::Users.save user
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user
    allow(SecureRandom).to receive(:uuid).and_return(profile_id)
    post create_profile_route, profile 
  }

  describe 'update_pictures' do

    it 'deletes pictures if no presented in new gallery' do
      expect(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      Services::Gallery.update_pictures profile_id
    end

    it 'does not delete images if unchanged' do
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      Services::Gallery.update_pictures profile_id, {photos: ['profile_picture.jpg']}
    end

    it 'creates new assets' do
      expect(Services::Assets).to receive(:create).with({profile_picture: ['profile_picture.jpg']}, profile_id).once
      Services::Gallery.update_pictures profile_id, {profile_picture: ['profile_picture.jpg']}
    end

  end


  describe 'delete_pictures' do

    it 'deletes unused pictures if there are no more holders' do
      expect(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      Services::Gallery.delete_pictures ['profile_picture.jpg'], profile_id
    end

    it 'does not delete picture if there are more holders' do

      Services::Assets.create({img: ['profile_picture.jpg']}, 'new_holder_id')
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      Services::Gallery.delete_pictures ['profile_picture.jpg'], profile_id 
    end
    
  end


end
