describe 'Actions Gallery and Assets' do
  let(:login_route){'/login/login'}
  let(:gallery_id){'8c41cf77-32b0-4df2-9376-0960e64a2222'}


  let(:user){
    {
      id: 'user_id',
      email: 'email@test.com',
      password: Services::Encryptor.encrypt('password'),
      validation: true
    }
  }

  let(:params){
    {
      id: gallery_id,
      photos: ['ph1', 'ph2'],
      links: 'links'
    }
  }

  let(:gallery){
    {
      :id=>gallery_id,
      :source=>"source", 
      :name=>nil, 
      :links=>"links", 
      :photos=>["ph1", "ph2"], 
      :profile_id=>gallery_id, 
      :user_id=>nil
    }
  }


  before(:each){
    Repos::Users.save user
    post login_route, user
    allow(SecureRandom).to receive(:uuid).and_return(gallery_id)

  }

  describe 'UserCreatesGallery' do


    it 'Creates and save new gallery' do
      expect(MetaRepos::Galleries).to receive(:save).once
      new_gallery = Actions::UserCreatesGallery.run params, 'source'
      expect(new_gallery).to include({photos: ["ph1","ph2"], source: 'source'})
    end


    it 'Creates the correspondig assets' do
      expect(Services::Assets).to receive(:create).with(gallery, gallery_id).once.and_call_original
      expect(MetaRepos::Assets).to receive(:save).twice
      Actions::UserCreatesGallery.run params, 'source'
    end


  end


  describe 'UserUpdatesGallery' do

    before(:each){
      Actions::UserCreatesGallery.run({
        :id=>gallery_id,
        :source=>"source", 
        :links=>"links", 
        :photos=>["ph3"], 
        :profile_id=>"profile_id"
      }, 'source')
      allow(Cloudinary::Api).to receive(:delete_resources)
    }

    it 'Updates' do
      expect(Services::Gallery).to receive(:update_pictures).with(gallery_id, gallery).once.and_call_original
      expect(MetaRepos::Assets).to receive(:delete).with(gallery_id).once
      expect(MetaRepos::Assets).to receive(:save).twice
      expect(MetaRepos::Galleries).to receive(:save).with(gallery)
      Actions::UserUpdatesGallery.run params, 'source'  
    end

  end

  describe 'UserDeletesGallery' do
    before(:each){
      Actions::UserCreatesGallery.run params, 'source'
      allow(Cloudinary::Api).to receive(:delete_resources)
    }
    it 'deletes' do
      expect(Services::Gallery).to receive(:update_pictures).with(gallery_id).once.and_call_original
      expect(MetaRepos::Assets).to receive(:delete).with(gallery_id).twice
      expect(MetaRepos::Galleries).to receive(:delete).with(gallery_id)
      Actions::UserDeletesGallery.run gallery_id
    end
  end


end
