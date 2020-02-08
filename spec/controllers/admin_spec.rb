require 'sidekiq/testing' 

describe AdminController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:admin_route){'/admin/'}
  let(:open_call_email_route){'/admin/open_call_email'}
  let(:send_generic_email_route){'/admin/send_email'}
  let(:delete_user_route){'/admin/delete_user'}

  let(:otter_user_id){'5c41cf77-32b0-4df2-9376-0960e64a65aa'}
  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a0000'}
  let(:admin_id){'00000000-32b0-4df2-9376-000000000000'}
  let(:event_id){'11112222-32b0-4df2-9376-000000000000'}

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
      lang: 'es',
      interests: {event_call: {categories: ""}}
    }
  }

  let(:otter_user){
    {
      id: otter_user_id,
      email: 'otter_email@test.com',
      password: 'otter_password',
      validation: true,
      lang: 'ca',
      interests: {event_call: {categories:['arts', 'music']}}
    }
  }


  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: true,
      lang: 'en',
      interests: {event_call: {categories:['arts', 'health']}}
    }
  }

  let(:event){
    {
      id: event_id,
      name: 'Event Demo',
      categories:{artist: ['music']},
      address: 'address',
      call_id: 'call_id',
      profile_id: 'profile_id'
    }
  }

  let(:profile_organizer){
    {
      id: 'profile_id',
      email: {value: 'email'}
    }
  }

  let(:call){
    {
      id: 'call_id', 
      deadline: '1540245600000'
    }
  }

  before(:each){
    Repos::Users.save otter_user
    Repos::Users.save user
    Repos::Users.save admin_user
    Repos::Events.save event
    Repos::Calls.save call
    Repos::Profiles.save profile_organizer
    MetaRepos::Admins.save admin
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
  }

  describe 'Admin Access' do

    it 'redirects the user to NOT FOUND if not logged in' do
      get admin_route
      expect(last_response.body).to include('Not Found')
    end

    it 'redirects the user to NOT FOUND if it is not the admin' do
      post login_route, otter_user
      get admin_route
      expect(last_response.body).to include('Not Found')
    end

    it 'redirects to admin page if user is admin' do
      post login_route, admin_user
      get admin_route
      expect(last_response.body).to include('Pard.Admin')
    end
  end
 
  describe 'Open call' do

    before(:each){
      post login_route, admin_user
    }

    it 'returns a hash with text including deadline, event name and event_id, the event categories, the event address and the email_type ' do
      post open_call_email_route, {event_id: event_id}
      expect(parsed_response['text'].keys).to eq( ["es", "ca","en"])
      expect(parsed_response['text']['es']['subject']).to include('Event Demo')
      expect(parsed_response['text']['es']['body']).to include('Event Demo')
      expect(parsed_response['text']['es']['body']).to include('23-10-2018')
      expect(parsed_response['text']['es']['body']).to include(event_id)
      expect(parsed_response['categories']).to eq(['music'])
      expect(parsed_response['address']).to eq('address')
      expect(parsed_response['email_type']).to eq('event_call')
    end

  end


  describe 'Generic mail' do

    let(:mailer){Services::Mails.new}

    def run_eventmachine
      Thread.new { EM.run } unless EM.reactor_running?
      Thread.pass until EM.reactor_running?
    end
    
    before(:each){
      post login_route, admin_user
      allow(Services::Mails).to receive(:new).and_return(mailer)
      Sidekiq::Worker.clear_all
      run_eventmachine
    }


    it 'does not send email to users not validate' do
      
      
      expect(mailer).to receive(:deliver_mail_to).exactly(1)
      Repos::Users.modify({id: user[:id], validation: false})
      Repos::Users.modify({id: otter_user[:id], validation: false})
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, target: 'interets', delivery_status: 'init'}

      Sidekiq::Worker.drain_all

    end

    it 'sends email to all users if not receiver specified nor email_type' do
      expect(mailer).to receive(:deliver_mail_to).exactly(3).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, target: 'interets', delivery_status: 'init'}

      Sidekiq::Worker.drain_all

    end

    it 'sends email to all users if not receiver specified nor target' do
      expect(mailer).to receive(:deliver_mail_to).exactly(3).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, email_type: 'event_call'}

      Sidekiq::Worker.drain_all

    end

    it 'filters all users by event_call interests and sends emails' do
      expect(mailer).to receive(:deliver_mail_to).exactly(1).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, email_type: 'event_call', target: {'categories' => ['health'] }}

      Sidekiq::Worker.drain_all

    end

    it 'returns delivery_status init' do
      expect(mailer).to receive(:deliver_mail_to).exactly(1).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, email_type: 'event_call', target: {'categories' => ['health'] }}
      expect(parsed_response['status']).to eq('success')

      Sidekiq::Worker.drain_all
      
    end

    it 'sends email to all users if not receiver specified nor target' do
      expect(mailer).to receive(:deliver_mail_to).exactly(3).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, email_type: 'event_call'}

      Sidekiq::Worker.drain_all

    end

    it 'sends email to specified receiver' do
      expect(mailer).to receive(:deliver_mail_to).exactly(1).times.and_call_original
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, receivers: ['test@test.test']}

      Sidekiq::Worker.drain_all
          
    end


    it 'handles errors for unexisting receiver' do
      allow(Pony).to receive(:mail).and_raise(Net::SMTPFatalError)
      post send_generic_email_route, {es: {body: 'cuerpo', subject: 'sujeto'}, receivers: ['test@test.test']}
      expect(parsed_response['status']).to eq('success')
    end



  end

  describe 'Admin deletes user' do

    before(:each){
      post login_route, admin_user
    }

    it 'fails if not admin' do
      post logout_route
      post login_route, otter_user
      post delete_user_route, {email: 'otter_email@test.com'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_admin')
    end

    it 'fails if user does not exist' do
      post delete_user_route, {email: 'noexisting@test.com'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_user')
    end

    it 'deletes the user' do
      expect(Actions::UserDeletesUser).to receive(:run).with(otter_user_id)
      post delete_user_route, {email: 'otter_email@test.com'}
      expect(parsed_response['status']).to eq('success')
    end

  end


  
end
