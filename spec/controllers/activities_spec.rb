describe ActivitiesController do

  include_examples 'http_methods'
  include_examples 'ids'  
  include_examples 'params'
  include_examples 'db_elements'

  let(:host_profile){
    {
      id: host_id
    }
  }

  let(:activities){[activity_params]}

  let(:params){{event_id: event_id, program: activities}}

  before(:each){
    Repos::Users.save user
    Repos::Users.save other_user
    Repos::Users.save admin_user
    MetaRepos::Admins.save admin
    Repos::Programs.save program
    Repos::Events.save event
    allow(SecureRandom).to receive(:uuid).and_return(activity_id)
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user
  }

  describe 'Create activity' do

    before(:each){
      Repos::Profiles.save call_participant_profile
      Repos::Profiles.save host_profile
    }

    it 'fails if the event does not exist' do
      params[:event_id] = 'otter'
      post create_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_event')
    end

    it 'fails if not the event owner' do
      allow(Repos::Events).to receive(:get_owner).with(event_id).and_return('otter')
      post create_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if missing mandatory fields' do
      activity_params[:dateTime] = nil
      post create_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if dateTime fields are blank' do
      activity_params[:dateTime] = [{date: 'date', time: []}]
      post create_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_dateTime')
    end

    it 'fails if the event is past' do
      Repos::Events.modify(
        {
          id: event_id, 
          eventTime: [
            { 
              "date": "2017-10-07",
              "time": ["1507363200000",  "1507413600000" ]
            },
            {
              "date": "2017-10-08",
              "time": ["1507449600000", "1507500000000"]
            }
          ]
        }
      )
      post create_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for admin if the event is past' do
      post logout_route
      post login_route, admin_user
      Repos::Events.modify(
        {
          id: event_id, 
          eventTime: [
            { 
              "date": "2017-10-07",
              "time": ["1507363200000",  "1507413600000" ]
            },
            {
              "date": "2017-10-08",
              "time": ["1507449600000", "1507500000000"]
            }
          ]
        }
      )
      post create_activity_route, params
      expect(parsed_response['status']).to eq('success')
    end

    it 'stores the activity' do
      expect(Repos::Activities).to receive(:save).with(activity).and_call_original
      post create_activity_route, params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model'].length).to eq(3)
    end

    it 'stores the activity and returns it with date and time params' do
      post create_activity_route, params

      returned_act_0 = activity
      returned_act_0[:date] = returned_act_0[:dateTime][0]["date"]
      returned_act_0[:time] = returned_act_0[:dateTime][0]["time"]
      returned_act_0[:id_time] = returned_act_0[:dateTime][0][:id_time]

      expect(parsed_response['model'][0]).to eq(Util.stringify_hash(returned_act_0))
    end


    it 'stores more activities at once  ' do
      expect(Repos::Activities).to receive(:save).twice
      params = {event_id: event_id, program: [activity_params, otter_activity_params]}
      post create_activity_route, params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model'].length).to eq(4)
    end


    it 'add participants and activity to program' do
      expect(Repos::Programs).to receive(:add_participant).twice.and_call_original
      expect(Repos::Programs).to receive(:add_activity).with(program_id, activity_id).and_call_original
      post create_activity_route, params
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Programs.get_participants(program_id)).to eq([host_id, call_participant_profile_id])
      expect(Repos::Programs.get_activities(program_id)).to eq([activity_id])
    end


    it 'does not add participants if already added' do
      post create_activity_route, params
 
      params[:program] = [otter_activity_params]
      expect(Repos::Programs).not_to receive(:add_participant)
      expect(Repos::Programs).to receive(:add_activity).with(program_id, otter_activity_id).and_call_original
      post create_activity_route, params
      expect(Repos::Programs.get_participants(program_id)).to eq([host_id, call_participant_profile_id])
    end

    it 'deletes the cache' do
      expect(CachedEvent).to receive(:delete).once.with(event_id)
      post create_activity_route, params
    end

    it 'creates a new own-participant if he does not exist' do
      activity_params.delete(:participant_id)
      activity_params[:name] = 'participant_name'
      activity_params[:phone] = {:value => 'phone'}
      activity_params[:email] = 'email@email'
      expect(Actions::CreatesParticipant).to receive(:run).once.and_call_original
      post create_activity_route, params
      expect(parsed_response['status']).to eq('success')
    end

    it 'returns the information of the new own-participant if he does not exist' do
      activity_params.delete(:participant_id)
      activity_params[:name] = 'participant_name'
      activity_params[:phone] = {:value => 'phone'}
      activity_params[:email] = 'email@email'
      post create_activity_route, params
      expect(parsed_response['model'][0]).to include({'participant_id'=>activity_id+'-own', 'participant_name' => 'participant_name', 'email'=>'email@email', 'phone'=>{'value'=>'phone'}})
    end


  end

  describe 'Modify activity' do

    before(:each){
      post create_activity_route, params
    }

    it 'fails if the event does not exist' do
      params[:event_id] = 'otter'
      post modify_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_event')
    end

    it 'fails if not the event owner' do
      allow(Repos::Events).to receive(:get_owner).with(event_id).and_return('otter')
      post modify_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if the activity does not exist' do
      activity_params[:id] = 'otter'
      post modify_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_activity')
    end

    it 'fails if the event is past' do
      Repos::Events.modify(
        {
          id: event_id, 
          eventTime:[
            { 
              "date": "2017-10-07",
              "time": ["1507363200000",  "1507413600000" ]
            },
            {
              "date": "2017-10-08",
              "time": ["1507449600000", "1507500000000"]
            }
          ]
        }
      )
      post modify_activity_route, params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end

    it 'modifies the activity' do
      activity_params[:price] = '30 euros'
      activity[:price] = '30 euros'
      expect(Repos::Activities).to receive(:modify).with(activity)
      post modify_activity_route, params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model'][0]["price"]).to eq('30 euros')
    end

    it 'deletes the cache' do
      expect(CachedEvent).to receive(:delete).once.with(event_id)
      post create_activity_route, params
    end
  end

  describe 'Delete activity' do

    before(:each){
      post create_activity_route, params
    }

    it 'fails if the user does not own the event' do
      allow(Repos::Events).to receive(:get_owner).with(event_id).and_return('otter')
      post delete_activity_route, {event_id: event_id, activity_id: activity_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if the event is past' do
      Repos::Events.modify(
        {
          id: event_id, 
          eventTime:[
            { 
              "date": "2017-10-07",
              "time": ["1507363200000",  "1507413600000" ]
            },
            {
              "date": "2017-10-08",
              "time": ["1507449600000", "1507500000000"]
            }
          ]
        }
      )
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end

    it 'deletes the activity' do
      expect(Repos::Activities).to receive(:delete).with(activity_id)
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model'].map{|act| act["date"]}).to eq(['2016-15-10', '2016-15-10', '2016-16-10'])
    end

    it 'removes participants if they have not any other activity' do
      expect(Repos::Programs).to receive(:remove_participant).twice
      expect(Repos::Programs).to receive(:remove_activity).with(program_id, activity_id)
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(parsed_response['status']).to eq('success')
    end


    it 'deos not remove participants if they have other activities' do
      params[:program] = [activity_params, otter_activity_params]
      post create_activity_route, params
      expect(Repos::Programs).not_to receive(:remove_participant)
      expect(Repos::Programs).to receive(:remove_activity).with(program_id, activity_id)
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(parsed_response['status']).to eq('success')
    end

    it 'deletes the cache' do
      expect(CachedEvent).to receive(:delete).once.with(event_id)
      post create_activity_route, params
    end

   

  end

  describe 'Delete activity with own-participant' do

    it 'deletes the own-participant if he does not have activities nor proposals' do

      #create activity and participant
      activity_params.delete(:participant_id)
      activity_params[:name] = 'participant_name'
      activity_params[:phone] = {:value => 'phone'}
      activity_params[:email] = 'email@email'
      expect(Actions::CreatesParticipant).to receive(:run).once.and_call_original
      activity_params[:dateTime] =[
        {date: '2016-15-10', time:['10','14'] }
      ]
      post create_activity_route, params
      expect(MetaRepos::Participants.exists? activity_id).to eq(true)
      activity_params[:id] = activity_id
      activity_params[:participant_id] = activity_id

      #delete activity and check if own-participant is deleted too
      expect(MetaRepos::Participants).to receive(:delete).with(activity_id).and_call_original
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(MetaRepos::Participants.exists? activity_id).to eq(false)
    end

    it 'does not delete the own-participant if it has more activies' do

      #create activity and participant
      activity_params.delete(:participant_id)
      activity_params[:name] = 'participant_name'
      activity_params[:phone] = {:value => 'phone'}
      activity_params[:email] = 'email@email'
      post create_activity_route, params
      expect(MetaRepos::Participants.exists? activity_id).to eq(true)
      activity_params[:id] = activity_id
      activity_params[:participant_id] = activity_id

      #save other activity
      # Repos::Activities.save({event_id: event_id, host_id: activity_id, program: program_id, id:'otter_activity_id'})
      Repos::Activities.save({event_id: event_id, participant_id: activity_id, program: program_id, id:'otter_activity_id'})

      #delete activity and check if own-participant is deleted too
      expect(MetaRepos::Participants).to_not receive(:delete)
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(MetaRepos::Participants.exists? activity_id).to eq(true)
    end


    it 'does not delete the own-participant if it has proposals' do

      #create activity and participant
      activity_params.delete(:participant_id)
      activity_params[:name] = 'participant_name'
      activity_params[:phone] = {:value => 'phone'}
      activity_params[:email] = 'email@email'
      expect(Actions::CreatesParticipant).to receive(:run).once.and_call_original
      activity_params[:dateTime] =[
        {date: '2016-15-10', time:['10','14'] }
      ]
      post create_activity_route, params
      expect(MetaRepos::Participants.exists? activity_id).to eq(true)
      activity_params[:id] = activity_id
      activity_params[:participant_id] = activity_id

      #save own-participant spaceproposal
      Repos::Spaceproposals.save({profile_id: activity_id, event_id: event_id})  
      # Repos::Artistproposals.save({profile_id: activity_id, event_id: event_id})  
      
      #delete activity and check if own-participant is deleted too
      expect(MetaRepos::Participants).to_not receive(:delete)
      post delete_activity_route, {event_id: event_id, program: [activity_params]}
      expect(MetaRepos::Participants.exists? activity_id).to eq(true)
    end

  end

end
