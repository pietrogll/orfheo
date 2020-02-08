describe User do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}

  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password',
    }
  }

  let(:user){User.new user_hash}
  let(:register_date){Time.new(2222, 01, 25)}


  describe 'Registration' do

    it 'adds user_id to a user' do
      expect(UUID.validate user[:id]).to eq(true)
    end

    it 'adds validation: false to a user' do
      expect(user[:validation]).to eq(false)
    end

    it 'adds validation_code: uuid to a user' do
      expect(UUID.validate user[:validation_code]).to eq(true)
    end

    it 'encrypts the password' do
      expect(BCrypt::Password).to receive(:create).with('password')
      User.new user_hash
    end

    it 'encrypts the password so that it can be verify by ==' do
      expect(user[:password] == user_hash[:password]).to be true
    end

    it 'saves the register date' do
      allow(Time).to receive(:now).and_return(register_date)
      expect(user[:register_date]).to be register_date.to_i*1000     
    end

  end
end
