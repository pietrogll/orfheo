describe Services::MailingList do

  include_examples 'ids'  


	let(:user_1){
    {
      id: admin_id,
      email: 'admin@test.com',
      password: 'admin_passwd',
      validation: true,
      lang: 'es',
      interests: {event_call: {categories: ""}}
    }
  }

  let(:user_2){
    {
      id: other_user_id,
      email: 'otter_email@test.com',
      password: 'otter_password',
      validation: true,
      lang: 'ca',
      interests: {event_call: {categories:['arts', 'music']}}
    }
  }


  let(:user_3){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      validation: true,
      lang: 'en',
      interests: {event_call: {categories:['arts', 'health']}}
    }
  }

  let(:list_email){['a@a.a','b@b.b','c@c.c','d@d.d']}

  let(:mailinglist_service){Services::MailingList}

  
  describe 'get_interested_users' do

	  before(:each){
	  	Repos::Users.save user_1
	  	Repos::Users.save user_2
	  	Repos::Users.save user_3
	  }

	  MAIL_ARGUMENTS = {'categories' => ['health'] }
	  MAIL_TYPE = :event_call

  	it 'returns all validated users if not both MAIL_TYPE and MAIL_ARGUMENTS are specified' do
			interested_users = [user_1, user_2, user_3]

			result = mailinglist_service.get_interested_users MAIL_TYPE
			expect(result).to eq interested_users

			result = mailinglist_service.get_interested_users
			expect(result).to eq interested_users
  	end

  	it 'returns only interested users' do
			interested_users = [user_3]
			result = mailinglist_service.get_interested_users MAIL_TYPE, MAIL_ARGUMENTS
			expect(result).to eq interested_users
  	end

  	it 'returns only validated users' do
  		Repos::Users.modify ({id: user_2[:id], validation: false})
			validated_users = [user_1, user_3]
			result = mailinglist_service.get_interested_users MAIL_TYPE
			expect(result).to eq validated_users
  	end


  end


end