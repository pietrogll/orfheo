describe ParticipantsController do

  include_examples 'http_methods'
  include_examples 'ids'  
  include_examples 'db_elements'

  
  let(:participant){
    {
        id: participant_id,
        name:'participant_name',
        email: {value: 'email@email.email', visible: false},
        phone: {:value => '32123123123', visible: 'false'},
        user_id: user_id
    }
  }

  let(:participant_returned){
    {
        profile_id: participant_id+'-own',
        name:'participant_name',
        email: 'email@email.email',
        phone: {:value => '32123123123', visible: 'false'},
        user_id: user_id
    }
  }

  let(:params){
    {
      id: participant_id,
      name:'other_participant_name',
      email: 'email@email.email',
      phone: {'value'=> '32123123123', 'visible'=> 'false'},
      event_id: event_id
    }
  } 


  before(:each){
    MetaRepos::Participants.save participant
    Repos::Users.save user
    Repos::Users.save other_user
    Repos::Users.save admin_user
    MetaRepos::Admins.save admin_user
    Repos::Events.save event
    post logout_route
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user
    allow(Repos::Events).to receive(:is_future_event?).and_return(true) 
  }

  describe 'modify_participant_route' do


    it 'has the corresponding controller' do
      post modify_participant_route, {}
    end

    it 'fails if not the user_owner nor the admin' do
      post logout_route
      post login_route, other_user
      participant[:name] = 'otter_participant'
      post modify_participant_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

     it 'fails if name already existing and do not belong to participant' do
      allow(Actions::CheckParticipantName).to receive(:run).and_return(false)
      post modify_participant_route, params 
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_name')
    end

    it 'calls Actions::ModifiesParticipant' do
      expect(Actions::ModifiesParticipantForManager).to receive(:run).with(Util.stringify_hash params)
      post modify_participant_route, params
    end

    it 'modifies participant' do
      participant[:name] = 'other_participant_name'
      participant_returned[:name] = 'other_participant_name'

      post modify_participant_route, params 

      expect(parsed_response['status']).to eq('success')
      expect(MetaRepos::Participants.get_by_id(participant_id)[:name]).to eq('other_participant_name')
      expect(parsed_response['model']).to eq(Util.stringify_hash participant_returned.except(:user_id))

    end

   

  end

end
