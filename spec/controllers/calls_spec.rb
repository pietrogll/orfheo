describe CallsController do

  include_examples 'http_methods'
  include_examples 'ids'
  include_examples 'db_elements'


  let(:event){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: event_id,
      program_id: 'program_id',
      call_id: call_id,
      name: 'event_name',
      eventTime: [
        {
          "date": "2017-04-25",
          "time": [ 
            "1493136000000", 
            "1493157600000"
          ]
        },
        {
          "date": "2017-04-26",
          "time": [ 
            "1493222400000", 
            "1493244000000"
          ]
        }
      ],
      participants: {}
    }
  }


  let(:call){
    {
      id: call_id,
      user_id: user_id,
      event_id: event_id,
      profile_id: profile_id,
      start: '1462053600',
      deadline: '1466028000',
      whitelist: [],
      conditions: 'conditions',
      forms: ['form_id_1', 'form_id_2', 'form_id_3', 'form_id_4']
    }
  }


  let(:artist_blocks){
    {
      es:{
        title: {type: "mandatory"},
        # format: {type: "mandatory"},
        description: {type: "mandatory"},
        short_description: {type: "mandatory"},
        duration: {type: "mandatory"},
        '1': {type: "optional", input:'UploadPhotos'},
        '2': {type: "mandatory", input: 'Input'},
        '3':{type: "optional", input: "LinkUploadPDF"},
        '4':{type:"optional", input: "SummableInputs", args:[{'0':{type: "optional", input:"UploadPDF"}}]},
        category: {type:'mandatory'},
        # form_id: {type: "mandatory"},
        subcategory: {type: "mandatory"},
        photos: {type: "optional"}
      }
    }
  }

  let(:space_block){
    {
      es:{
          # subcategory: 'subcategory'
          '1': {type: "optional"},
          '2': {type: "mandatory"},
          ambient_info:{
            capacity:{type:"mandatory"}
          }
      }
    }
  }

  let(:artist_form_1){
    {
      id: 'form_id_1',
      call_id: call_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: 'texts'
      },
      own: 'own'
    }
  }


  let(:artist_form_2){
    {
      id: 'form_id_2',
      call_id: call_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: 'texts'
      }
    }
  }


  let(:space_form_1){
    {
      id: 'form_id_3',
      call_id: call_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      }
    }
  }

  let(:space_form_2){
    {
      id: 'form_id_4',
      call_id: call_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      },
      own:'private'
    }
  }


  let(:call_to_save){
    {
      id: call_id,
      user_id: user_id,
      event_id: event_id,
      profile_id: profile_id,
      start: '1462053600',
      deadline: '1466028000',
      conditions: 'conditions'
      }
    }



  before(:each){
    Repos::Users.save user
    Repos::Users.save other_user
    Repos::Users.save admin_user
    Repos::Forms.save artist_form_1
    Repos::Forms.save artist_form_2
    Repos::Forms.save space_form_1
    Repos::Forms.save space_form_2
    Repos::Profiles.save({id: profile_id, user_id: user_id}) 
    Repos::Events.save(event)
    Repos::Calls.save(call)
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user
    allow(Services::WsClients).to receive(:send_message).and_return(true)
    MetaRepos::Admins.save admin
  }



  describe 'Get call' do


    it 'fails if not admin' do
      get '/call', call_id
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_admin')
    end

    it 'gets the call by id' do
      post logout_route
      post login_route, admin_user
      get '/call', {id: call_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['call']).to include(Util.stringify_hash(call))
    end

  end


  describe 'Create' do

     before(:each){
      Repos::Calls.delete call_id
    }

    it 'fails if the profile does not exist' do
      call_to_save[:profile_id] = 'other_profile_id'
      post create_call_route, call_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end


    it 'fails if not the owner or admin' do
      post logout_route
      post login_route, other_user
      post create_call_route, call_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end


    it 'creates a call' do
      call.delete(:forms)
      expect(Repos::Calls).to receive(:save).with(call)
      post create_call_route, call_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['call']).to include(Util.stringify_hash(call))
    end

    it 'adds call_id to corresponading event' do
      expect(Repos::Events).to receive(:modify).with({
        id: call_to_save[:event_id],
        call_id: call_id
      })
      post create_call_route, call_to_save
    end

    it 'creates a call if admin' do
      post logout_route
      post login_route, admin_user
      call.delete(:forms)
      expect(Repos::Calls).to receive(:save).with(call)
      post create_call_route, call_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['call']).to include(Util.stringify_hash(call))
    end


  end


  describe 'Modify' do

    it 'fails if the call does not exist' do
      call[:id] = 'other_call_id'
      post modify_call_route, call
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'fails if not the owner or admin' do
      post logout_route
      post login_route, other_user
      post modify_call_route, call_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('call_ownership')
    end


    it 'modifies the call' do
      call_to_save[:start] = '1111799201111'
      call_to_save.delete :conditions;
      expect(Repos::Calls).to receive(:modify).with(call_to_save)
      post modify_call_route, call_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['call']).to include(Util.stringify_hash(call_to_save))
    end

    it 'modifies the program if admin' do
      post logout_route
      post login_route, admin_user
      call_to_save[:start] = '1111799201111'
      call_to_save.delete :conditions;
      expect(Repos::Calls).to receive(:modify).with(call_to_save)
      post modify_call_route, call_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['call']).to include(Util.stringify_hash(call_to_save))      
    end


  end



  describe 'delete_call' do

    let(:activity){{id: 'a_1_id', participant_proposal_id: 'participant_proposal_id', host_proposal_id: 'host_proposal_id', event_id: event_id, program_id: 'program_id'}}
    let(:artistproposal){{id: 'participant_proposal_id', call_id: call_id, profile_id: 'participant_id', user_id: 'user_id_2'}}
    let(:spaceproposal){{id: 'host_proposal_id', call_id: call_id, profile_id: 'host_id', user_id: 'user_id_1'}}
    let(:participant){{id: 'participant_id', email: {value: 'contact_email@test.com'}, user_id: other_user_id}}
    let(:host){{id: 'host_id', email: {value: 'host_email@test.com'}, user_id: user_id}}

    let(:mailer){Services::Mails.new}
    

    before(:each){
      post logout_route
      post login_route, admin_user
      Repos::Activities.save(activity)
      Repos::Artistproposals.save(artistproposal)
      Repos::Spaceproposals.save(spaceproposal)
      Repos::Calls.modify(id: call_id, participants: ['participant_id', 'host_id'])
      Repos::Profiles.save(participant)
      Repos::Profiles.save(host)
      allow(Repos::Forms).to receive(:get_form_blocks).and_return({})
      allow(Services::Mails).to receive(:new).and_return(mailer)
    }
    
   
    it 'updates all activities' do
      expect(Services::Programs).to receive(:make_up_activity_with).once.with([artistproposal], [spaceproposal], activity)
      expect(Repos::Activities).to receive(:modify).once
      post delete_call_route, {id: call_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'sends email to applicants' do
      allow(Time).to receive(:now).and_return(Time.new(2000, 05, 01))
      expect(mailer).to receive(:deliver_mail_to).twice
      post delete_call_route, {id: call_id}
    end

    it 'sends email only to exiting profiles' do
      Repos::Profiles.delete 'host_id'
      allow(Time).to receive(:now).and_return(Time.new(2000, 05, 01))
      expect(mailer).to receive(:deliver_mail_to).once.with({email: 'contact_email@test.com', lang: 'en'}, :deleted_call, {event_name: 'event_name'})
      post delete_call_route, {id: call_id}
    end

     it 'does not send email to applicants if event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 01))
      expect(mailer).not_to receive(:deliver_mail_to)
      post delete_call_route, {id: call_id}
    end

    it 'deletes all the proposals of the call' do
      expect(Repos::Artistproposals).to receive(:delete_many).with({call_id: call_id}).and_call_original
      expect(Repos::Spaceproposals).to receive(:delete_many).with({call_id: call_id}).and_call_original
      expect(Actions::DeleteProposalsPictures).to receive(:run).once.with([artistproposal], [spaceproposal])
      post delete_call_route, {id: call_id}
      expect(Repos::Artistproposals.get(call_id: call_id)).to eq([])
      expect(Repos::Spaceproposals.get(call_id: call_id)).to eq([])
    end

    it 'deletes the call and all its forms' do
      expect(Repos::Forms).to receive(:delete_many).with({call_id: call_id}).and_call_original
      expect(Repos::Calls).to receive(:delete).with(call_id)
      post delete_call_route, {id: call_id}
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Forms.get(call_id: call_id)).to eq([])
    end

    it 'removes call_id from event' do
      expect(Repos::Events).to receive(:unset).with(event_id, {call_id:""}).and_call_original
      post delete_call_route, {id: call_id}
      expect(Repos::Events.get_by_id(event_id)[:call_id]).to eq(nil)
    end

  end



  describe 'Whitelist' do

    let(:whitelisted){
      {
        email: 'otter@otter.com',
        name_email: 'otter@otter.com'
      }
    }

    it 'stores a whitelist' do
      allow(Time).to receive(:now).and_return(Time.new(1976, 05, 02))
      expect(Repos::Calls).to receive(:add_whitelist).with(call_id, [whitelisted])
      post '/users/add_whitelist', {event_id: event_id, call_id: call_id, email: whitelisted[:email], name_email: whitelisted[:name_email]}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq([Util.stringify_hash(whitelisted)])
    end

    it 'fails if event is past' do
      post '/users/add_whitelist', {event_id: event_id, call_id: call_id, email: whitelisted[:email], name_email: whitelisted[:name_email]}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end

    it 'deletes a whitelisted' do
      allow(Time).to receive(:now).and_return(Time.new(1976, 05, 02))
      post '/users/add_whitelist', {event_id: event_id, call_id: call_id, email: whitelisted[:email], name_email: whitelisted[:name_email]}
      expect(Repos::Calls).to receive(:add_whitelist).with(call_id, []).and_call_original
      post '/users/delete_whitelist', {event_id: event_id, call_id: call_id, email: whitelisted[:email]}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq([])
    end
  end


  describe 'get_call_proposals' do
    before(:each){
      Repos::Spaceproposals.save({call_id: call_id, form_id: '2'})
      Repos::Spaceproposals.save({call_id: call_id, form_id: '1'})
    }
    it 'gets proposals depending on type and form_id' do
      expect(Repos::Spaceproposals).to receive(:get).with({call_id: call_id, 'form_id'=> '2'}).and_call_original
      expect(Repos::Artistproposals).not_to receive(:get)
      post '/users/get_call_proposals', {call_id: call_id, type: 'space', filters:{form_id: '2'}}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['proposals']).to eq([{'call_id'=> call_id, 'form_id'=> '2'}])

    end

  end

  describe 'Check participant name' do

    it 'returns true if no participants has the name' do
      post check_name_route, {name: 'participant_name', call_id: call_id, participant_id: nil}
    end


    it 'returns false if other participant (Participant) has the same name' do
      Repos::Calls.add_participant call_id, 'participant_id'
      MetaRepos::Participants.save({id:'participant_id', name: 'participant_name'})
      post check_name_route, {name: 'participant_name', call_id: call_id, participant_id: nil}
    end

    it 'returns false if other participant (Profile) has the same name' do
      Repos::Calls.add_participant call_id, 'participant_id'
      Repos::Profiles.save({id:'participant_id', name: 'participant_name'})
      post check_name_route, {name: 'participant_name', call_id: call_id, participant_id: nil}
    end


    it 'returns true if the name belong to the participant' do
      Repos::Calls.add_participant call_id, 'participant_id'
      MetaRepos::Participants.save({id:'participant_id', name: 'participant_name'})
      post check_name_route, {name: 'participant_name', call_id: call_id, participant_id: 'participant_id'}
    end

  end


end
