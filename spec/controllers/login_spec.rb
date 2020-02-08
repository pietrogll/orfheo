describe LoginController do

  let(:register_route){'/login/register'}
  let(:login_route){'/login/login'}

  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      notification: true
    }
  }

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}

  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      validation: false,
      validation_code: validation_code
    }
  }

  let(:current_time){Time.now}
  let(:current_millisec_time){current_time.to_i*1000}

  let(:mailer){Services::Mails.new}

  before(:each){
    allow(Services::Mails).to receive(:new).and_return(mailer)
    
  }

  describe 'Registration attempt' do

    it 'cannot register a user with no email' do
      post register_route, {
        email: nil,
        password: 'password'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_email')
    end

    it 'cannot register a user with no valid email' do
      post register_route, {
        email: 'invalid',
        password: 'password'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_email')
    end

    it 'cannot register a user with no password' do
      post register_route, {
        email: 'email@test.com',
        password: nil
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_password')
    end

    it 'cannot register a user with a password less than 8 characters' do
      post register_route, {
        email: 'email@test.com',
        password: 'pass'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_password')
    end

    it 'registers an unactivated user' do
      klass = Repos.const_get 'Users'
      expect(klass).to receive(:save).with(hash_including(user_hash.except(:notification, :password)))
      post register_route, user_hash
      expect(parsed_response['status']).to eq('success')
    end

    it 'registers an unactivated user with an encrypted password' do
      post register_route, user

      Repos::Users.get_by_id user_id
      expect(parsed_response['status']).to eq('success')
    end

    it 'adds interests to a new user' do
      expect(ApiStorage.repos(:users)).to receive(:save).with(hash_including(interests: {event_call:{categories: ApiStorage.production_categories}})).and_call_original
      post register_route, user_hash
      expect(parsed_response['status']).to eq('success')
      user = Repos::Users.get({email: 'email@test.com'}).first
      expect(user[:interests][:event_call][:categories]).to eq(ApiStorage.production_categories)
    end

     it 'do not add interests to a new user if notification false' do
      expect(ApiStorage.repos(:users)).to receive(:save).with(hash_including(interests: {event_call:{categories: ""}})).and_call_original
      user_hash[:notification] = false
      post register_route, user_hash
      expect(parsed_response['status']).to eq('success')
      user = Repos::Users.get({email: 'email@test.com'}).first
      expect(user[:interests][:event_call][:categories]).to eq("")
    end

    it 'delivers a welcome mail to the user' do
      expect(mailer).to receive(:deliver_mail_to).with(hash_including(user_hash.except(:notification, :password)), :welcome)

      post register_route, user_hash
      expect(parsed_response['status']).to eq('success')
    end

    it 'delivers event email to the user' do
      user_hash[:event_id] = 'event_id'
      allow(Repos::Events).to receive(:exists?).with('event_id').and_return(true)
      allow(Repos::Events).to receive(:get_by_id).and_return({name: 'event_name'})
      expect(mailer).to receive(:deliver_mail_to).with(hash_including(email: 'email@test.com'), :event, {event_id: 'event_id', event_name: 'event_name'})

      post register_route, user_hash
      expect(parsed_response['status']).to eq('success')
    end

    it 'cannot register a user twice' do
      post register_route, user_hash
      post register_route, user_hash
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('already_registered')
    end
  end

  describe 'Validation' do

    let(:validation_route){'/login/validate?id=' + validation_code}

    before(:each){
      allow(SecureRandom).to receive(:uuid).and_return validation_code
      post register_route, user_hash
    }

    it 'redirects to registration if the validation code does not exist' do
      get '/login/validate?id=otter'

      expect(last_response.location).to eq('http://example.org/')
    end

    it 'validates the user' do
      expect(Repos::Users).to receive(:validate).with(validation_code)
      get validation_route
    end

    it 'stores the user identity and redirects to users' do
      user_id = validation_code

      get validation_route      

      expect(session[:identity]).to eq(user_id)
      expect(last_response.location).to eq('http://www.orfheo.org/users/')
    end

    it 'stores the user last_login and saves it in the db' do
     allow(Time).to receive(:now).and_return(current_time)

      user_id = validation_code
      get validation_route      

      expect(session[:last_login]).to eq(current_time)
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to eq(current_millisec_time)
    end

    it 'redirects to event page if event_id is provided' do
      allow(Repos::Events).to receive(:exists?).with(event_id).and_return(true)
      get '/login/validate?id=' + validation_code + '&event_id=' + event_id

      expect(last_response.location).to eq('http://www.orfheo.org/event?id=' + event_id)
    end
  end

  describe 'LogIn' do

    it 'fails if the email is not valid' do
      post login_route, {
        email: 'email',
        password: 'password'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_email')
    end

    it 'fails if the password is not valid' do
      post login_route, {
        email: 'email@test.com',
        password: 'miau'
      }
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_password')
    end

    it 'fails if the user does not exist' do
      post login_route, user_hash
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_user')
    end

    it 'fails if the user is not validated' do
      post register_route, user_hash

      post login_route, user_hash

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('not_validated_user')
    end

    it 'fails if the user and the password do not match' do
      post register_route, user_hash

      Repos::Users.validate validation_code
      post login_route, {
        email: 'email@test.com',
        password: 'otter_password'
      }

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('incorrect_password')
    end

    it 'it is successful and stores the user identity' do
      allow(SecureRandom).to receive(:uuid).and_return validation_code
      user_id = validation_code
      post register_route, user_hash
      Repos::Users.validate validation_code
      
      post login_route, user_hash

      expect(session[:identity]).to eq(user_id)
      expect(parsed_response['status']).to eq('success')
    end


    it 'it stores the user last_login and saves it in the db' do

    
      allow(Time).to receive(:now).and_return(current_time)


      allow(SecureRandom).to receive(:uuid).and_return validation_code
      user_id = validation_code
      post register_route, user_hash
      Repos::Users.validate validation_code

      post login_route, user_hash

      expect(session[:last_login]).to eq(current_time)
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to eq(current_millisec_time)

    end




  end

  describe 'Logout' do

    let(:logout_route){'/login/logout'}

    it 'ends the session and clean it' do
      post register_route, user_hash
      
      Repos::Users.validate validation_code
      post login_route, user_hash
      post logout_route
      expect(session[:identity]).to eq(nil)
      expect(session[:last_login]).to eq(nil)
      expect(parsed_response['status']).to eq('success')
    end
  end

  describe 'Forgotten password' do

    let(:forgotten_password_route){'/login/forgotten_password'}

    it 'fails if the email is not valid' do
      post forgotten_password_route, {email:'email@testcom'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_email')
    end

    it 'fails if the email does not exist' do
      post forgotten_password_route, {email:'email@test.com'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_user')
    end

    it 'generates a new validation_code for the user' do
      post register_route, user

      expect(Repos::Users).to receive(:reseted_user).with('email@test.com').and_call_original
      post forgotten_password_route, {email:'email@test.com'}
      expect(parsed_response['status']).to eq('success')
    end

    it 'delivers a password mail to the user' do
      post register_route, user

      expect(mailer).to receive(:deliver_mail_to).with(hash_including(user_hash.except(:notification, :password)), :forgotten_password)

      post forgotten_password_route, {email:'email@test.com'}
      expect(parsed_response['status']).to eq('success')
    end
  end

  describe 'Login and Open Settings poup' do

    before(:each){
      post register_route, user
    }

    xit 'redirects to registration if the validation code does not exist' do
      get '/login/open_settings?id=otter'
      expect(last_response.location).to eq('http://example.org/')
    end


    xit 'redirects to users with settings has' do
      get '/login/open_settings?id='+user_id
      expect(session[:identity]).to eq(user_id)
      expect(last_response.location).to eq('http://www.orfheo.org/users/#&settings')
    end
   
  end


end
