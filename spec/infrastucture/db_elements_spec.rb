describe 'actions/db_element.rb' do
  let(:login_route){'/login/login'}
  let(:profile_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}

  let(:user){
    {
      id: 'user_id',
      email: 'email@test.com',
      password: Services::Encryptor.encrypt('password'),
      validation: true
    }
  }

  let(:profile){
    { 
      id: profile_id, 
      user_id:'user_id',
      name: 'name'
    }
  }

 
  before(:each){
    Repos::Users.save user
    Repos::Profiles.save profile
    post login_route, user
  }

  describe 'CheckDbElementExistence' do

    it 'fails if no id specified' do
      params = {name: 'new_name', color: 'color'}      
      expect{ Actions::CheckDbElementExistence.run :profiles, nil}.to raise_error(Pard::Invalid::Params)
    end

    it 'fails if element does not exist' do
      params = {id: 'otter_id', name: 'new_name', color: 'color'}
      expect{ Actions::CheckDbElementExistence.run :profiles, params }.to raise_error(Pard::Invalid::UnexistingDbEl)
    end

  end

  describe 'GetByIdDbElement' do
    
    it 'fails if no id specified' do
      expect{ Actions::GetByIdDbElement.run :profiles, nil}.to raise_error(Pard::Invalid::Params)
    end

    it 'fails if no id specified' do
      id = profile_id
      result = Actions::GetByIdDbElement.run(:profiles, profile_id)
      
      expect(result).to eq profile
    end

  end

  describe 'UpdateDbElement' do

    it 'fails if no id specified' do
      params = {name: 'new_name', color: 'color'}      
      expect{ Actions::UpdateDbElement.run :profiles, params }.to raise_error(Pard::Invalid::Params)
    end

    it 'fails if element does not exist' do
      params = {id: 'otter_id', name: 'new_name', color: 'color'}
      expect{ Actions::UpdateDbElement.run :profiles, params }.to raise_error(Pard::Invalid::UnexistingDbEl)
    end

    it 'modifies the db element' do
      params = {id: profile_id, name: 'new_name', color: 'color'}
      expect(Repos::Profiles).to receive(:modify).once.with(params).and_call_original
      el = Actions::UpdateDbElement.run :profiles, params
      expect(Repos::Profiles.get_by_id profile_id).to eq({ 
        id: profile_id, 
        user_id: 'user_id',
        name: 'new_name',
        color: 'color'
      }) 
    end


  end




end
