describe WelcomeController do

  let(:login_route){'/login/login'}
  let(:tech_support_route){'/techSupport'}


  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password'
    }
  }

  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:otter_user_id){'5c41cf77-32b0-4df2-9376-0960e64a65aa'}
  let(:admin_id){'00000000-32b0-4df2-9376-000000000000'}

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
    }
  }

  let(:otter_user){
    {
      id: otter_user_id,
      email: 'otter_email@test.com',
      password: 'otter_password',
      validation: true,
    }
  }


  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: Services::Encryptor.encrypt('password'),
      lang: 'es',
      validation: false,
      validation_code: validation_code
    }
  }

  let(:params_tech_support){
    {
      :email => 'email@email.email', 
      :subject => 'email_subject', 
      :name => 'sender_name', 
      :message => 'email_message'
    }  
  }

  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    Repos::Users.save otter_user
    Repos::Users.save admin_user
    MetaRepos::Admins.save admin
  }
  

  describe 'Access' do
    it 'redirects to users page if already logged in' do
      # allow(Services::Encryptor).to receive(:check_equality).and_return(true)
      post login_route, user_hash
      get '/'
      expect(last_response.location).to eq('http://example.org/users/')
    end

    it 'stores the current_time in session.last_login' do
      current_time = Time.now
      allow(Time).to receive(:now).and_return(current_time)

      post login_route, user_hash
      expect(Actions::UpdateLoginTime).to receive(:run).with(user_id, current_time)
      get '/'
    end

  end


  describe '/techSupport' do

    let(:mailer){Services::Mails.new}

    it 'calls the mailer service' do
      allow(Services::Mails).to receive(:new).and_return(mailer)

      expect(mailer).to receive(:deliver_mail_to).once.with(
        {:email => 'tech@orfheo.org'}, 
        :techSupport, 
        {:browser=>nil, :email =>"email@email.email",:message=>"email_message",:name=>"sender_name", :profile=>nil, :subject=>"email_subject"}
      )

      post tech_support_route, params_tech_support
    end

    it 'sends an email to tech@orfheo.org' do
      expect(Services::Mails::PonyMailer).to receive(:deliver_to).with('tech@orfheo.org')
      post tech_support_route, params_tech_support
      expect(parsed_response['status']).to eq('success')
    end


  end


end
