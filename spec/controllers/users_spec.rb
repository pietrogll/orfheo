describe UsersController do

  let(:login_route){'/login/login'}
  let(:create_profile_route){'/users/create_profile'}
  let(:delete_user_route){'/users/delete_user'}
  let(:get_user_email_route){'/users/get_user_email'}
  let(:save_interests_route){'/users/save_interests'}

  let(:password){'password'}


  let(:user_hash){
    {
      email: 'email@test.com',
      password: password
    }
  }

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a65aa'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}

  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: Services::Encryptor.encrypt(password),
      validation: false,
      validation_code: validation_code
    }
  }

   let(:users_route){'/users/'}
    let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
    let(:otter_profile_id){'aaa01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

    let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: ['artist'],
      tags: nil,
      name: 'name',
      email: {'visible' => 'false', 'value' => "pippo@aol.com"},
      profile_picture: nil,
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

  let(:otter_profile){
    {
      user_id: user_id,
      id: otter_profile_id,
      phone: 'phone',
      facets: ['artist'],
      name: 'otter_profile_name',
      address: {'postal_code' => '33333', 'locality' => 'otter_city'},
      color: 'color',
      email: {'visible' => 'true', 'value' => 'otter@aol.com'}
    }
  }

  let(:encryptor){Services::Encryptor}

  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
  }

  describe 'Access' do



    it 'redirects the user to the welcome page if not logged in' do
      get users_route
      expect(last_response.location).to eq('http://example.org/')
    end

    it 'gets the profiles of the user and other profiles' do
      post login_route, user_hash
      expect(Repos::Profiles).to receive(:get_user_profiles).with(user_id)
      get users_route
    end

    it 'redirects to user page' do
      post login_route, user_hash

      get users_route

      expect(last_response.body).to include('Pard.Users')
    end
  end

  describe 'Modify password' do

    let(:modify_password_route){'/users/modify_password'}

    before(:each){
      post login_route, user_hash
    }

    it 'fails if the password is not valid' do
      post modify_password_route, {password: 'miau'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_password')
    end

    it 'changes the old password for the new one' do
      NEW_PASSWORD = 'new_password'

      expect(Repos::Users).to receive(:modify).and_call_original
      post modify_password_route, {password: NEW_PASSWORD}

      saved_password = Repos::Users.get_by_id(user_id)[:password]
      expect(encryptor.check_equality(saved_password, NEW_PASSWORD)).to be true
      expect(parsed_response['status']).to eq('success')
    end
  end

  describe 'Get User Email' do
    it 'devolves email if user il logged in' do
      post login_route, user_hash
      get get_user_email_route
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['user_email']).to eq('email@test.com')
    end
  end

  describe 'Delete' do
    it 'deletes a user and terminates the session' do
      post login_route, user_hash
      post delete_user_route
      expect(session[:identity]).to eq(nil)
      expect(session[:last_login]).to eq(nil)
      expect(parsed_response['status']).to eq('success')
      post login_route, user_hash
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_user')
    end

    it 'deletes all profiles of the user' do
      post login_route, user_hash
      post create_profile_route, profile
      post create_profile_route, otter_profile

      expect(Repos::Profiles).to receive(:delete).twice.and_call_original
      expect(Repos::Users).to receive(:delete).with(user_id).and_call_original

      post delete_user_route

      expect(Repos::Profiles.get_user_profiles(user_id).blank?).to be(true)

    end
  end

   describe 'Interests' do

    it 'saves the interests' do
      interests = 'interests'
      post login_route, user_hash
      expect(Repos::Users).to receive(:modify).once.with({id: user_id, interests: interests}).and_call_original
      post save_interests_route, {id: user_id, interests: interests}
      expect(parsed_response['status']).to eq('success')
    end

  end

end
