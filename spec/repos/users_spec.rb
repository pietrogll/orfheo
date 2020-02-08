describe Repos::Users do

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}

  let(:unvalidated_user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: false,
      validation_code: validation_code
    }
  }

  before(:each){
    Repos::Users.save unvalidated_user
    unvalidated_user.delete(:_id)
  }

  describe 'Add' do

    it 'registers an unvalidated user' do
      saved_entry = @db['users'].find({}).first
      expect(saved_entry).to include({
        'id' => user_id,
        'email' => 'email@test.com',
        'password' => 'password',
        'validation' => false,
        'validation_code' => validation_code
      })
    end
  end

  describe 'Modify' do

    it 'modifies a field' do
      Repos::Users.modify({id: user_id, password: 'otter_password'})
      saved_entry = @db['users'].find({}).first
      expect(saved_entry).to include({
        'id' => user_id,
        'email' => 'email@test.com',
        'password' => 'otter_password',
        'validation' => false,
        'validation_code' => validation_code
      })
    end
  end

  describe 'Exists?' do
    it 'checks if matched element is already in any document' do
      expect(Repos::Users.exists?({email:'email@test.com'})).to eq(true)
      expect(Repos::Users.exists?({email:'otter@test.com'})).to eq(false)
    end
  end

  describe 'Validate' do

    it 'validates a user' do
      Repos::Users.validate(validation_code)
      saved_entry = @db['users'].find({}).first
      expect(saved_entry).to include({
        'id' => user_id,
        'email' => 'email@test.com',
        'password' => 'password',
        'validation' => true,
      })
    end

    it 'deletes the validation_code from the saved_entry' do
      Repos::Users.validate(validation_code)
      saved_entry = @db['users'].find({}).first
      expect(saved_entry).not_to include({
        'validation_code' => validation_code
      })
    end

    it 'returns the user_id' do
      expect(Repos::Users.validate(validation_code)).to eq(user_id)
    end
  end

  describe 'Reseted user' do

    it 'adds a new validation code to the user' do
      Repos::Users.validate(validation_code)
      Repos::Users.reseted_user('email@test.com')
      saved_entry = @db['users'].find({}).first
      expect(UUID.validate saved_entry['validation_code']).to eq(true)
    end

    it 'returns the user after the reset' do
      expect(Repos::Users.reseted_user('email@test.com')).to include({
        id: user_id,
        email: 'email@test.com',
        password: 'password',
        validation: false,
      })
    end
  end

  describe 'Grab' do

    it 'returns the desired document' do
      expect(Repos::Users.get({email:'email@test.com'}).first).to eq(unvalidated_user)
    end
  end

  describe 'Delete' do

    it 'deletes a user' do
      expect(Repos::Users.exists?({id: user_id})).to eq(true)
      Repos::Users.delete(user_id)
      expect(Repos::Users.exists?({id: user_id})).to eq(false)
    end
  end
end
