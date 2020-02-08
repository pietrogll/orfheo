describe ProgramsController do 

	let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:space_order_route){'/users/space_order'}
  let(:publish_route){'/users/publish'}
  let(:publish_route){'/users/publish'}
  let(:save_subcategories_price_route){'/users/artist_subcategories_price'}
  let(:create_program_route){'/users/create_program'}
  let(:modify_program_route){'/users/modify_program'}
  let(:delete_program_route){'/users/delete_program'}
  let(:set_permanents_route){'/users/set_permanents'}



  let(:admin_id){'00000000-ecac-4237-9740-c8ae7a586000'}
  let(:user_id){'45825599-b8cf-499c-825c-a7134a3f1ff0'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:program_id){'00000000-b8cf-499c-825c-a7134a3f1ff0'}
  let(:event_id){'45825599-0000-499c-825c-a7134a3f1ff0'}
  let(:activity_id){'45825599-0000-499c-825c-a7134a3faaaa'}
  let(:permanent_activity_id){'aa825599-0000-499c-825c-a7134a3faaaa'}
  let(:permanent_activity_id_2){'aaaaaaaa-0000-499c-825c-a7134a3faaaa'}
  let(:participant_id){'bbbb5599-0000-499c-825c-a7134a3faabb'}
  let(:other_user_id){'8c41cf77-32b0-4df2-9376-0960e64a2222'}



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
      lang: 'es'
    }
  }

  let(:user){  # IS THE ORGANIZER OF THE CALL
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      validation: true
    }
  }

  let(:other_user){
    {
      id: other_user_id,
      email: 'other@other.com',
      password: 'other_user_passwd',
      lang: 'en',
      validation: true
    }
  }



  let(:program){
    {
      id: program_id,  
      event_id: event_id,
      user_id: user_id, 
      activities: [], 
      participants: [], 
      order: [], 
      published: false, 
      subcategories: {
        'artist' => 'artist', 
        'space' => 'space'
      },
      texts: {
        'subcategories' => 'subcategories'
      },
      permanents: [{"date"=>'d', "time"=>['t','tt']}] 
    }
  }

  let(:program_to_save){
    {
      id: program_id,  
      event_id: event_id,
      user_id: user_id,
      subcategories: {
        artist: 'artist', 
        space: 'space'
      },
      texts: {
        subcategories:'subcategories'
      },
      permanents: [{"date"=>'d', "time"=>['t','tt']}]  
    } 
  }

  let(:event){
    {
      id: event_id,
      user_id: user_id,
      eventTime:[
        {
          "date": "2019-10-07",
          "time": [ 
            "2007363200000", 
            "2007413600000"
          ]
        }
      ]
    }
  }


  before(:each){
    Repos::Events.save event
    Repos::Programs.save program
    Repos::Programs.save event
    Repos::Users.save user
    Repos::Users.save admin_user
    Repos::Users.save other_user
    MetaRepos::Admins.save admin
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
 		post login_route, user
  }

  describe 'Get program' do


    it 'fails if not admin or owner' do
      post logout_route
      post login_route, other_user
      get '/program',  {id: program_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('program_ownership')
    end

    it 'gets the program by id' do
      post logout_route
      post login_route, admin_user
      get '/program', {id: program_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['program']).to include(Util.stringify_hash(program))
    end

  end

  describe 'Create' do

     before(:each){
      Repos::Programs.delete program_id
    }

    it 'fails if the event_id does not exist' do
      program_to_save[:event_id] = 'other_event_id'
      post create_program_route, program_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_event')
    end


    it 'fails if not the owner or admin' do
      post logout_route
      post login_route, other_user
      post create_program_route, program_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end


    it 'creates a program' do
      expect(Repos::Programs).to receive(:save).with(program)
      post create_program_route, program_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['program']).to include(Util.stringify_hash(program))
    end

    it 'adds program_id to corresponading event' do
      expect(Repos::Events).to receive(:modify).with({
        id: program_to_save[:event_id],
        program_id: program_id
      })
      post create_program_route, program_to_save
    end

    it 'creates a program if admin' do
      post logout_route
      post login_route, admin_user
      expect(Repos::Programs).to receive(:save).with(program)
      post create_program_route, program_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['program']).to include(Util.stringify_hash(program))
    end


  end


  describe 'Modify' do

    it 'fails if the program does not exist' do
      program[:id] = 'other_program_id'
      post modify_program_route, program
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_program')
    end

    it 'fails if not the owner or admin' do
      post logout_route
      post login_route, other_user
      post modify_program_route, program_to_save
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('program_ownership')
    end


    it 'modifies the program' do
      program_to_save[:subcategories] = {
        'artist' => 'new_artist', 
        'space' => 'new_space'
      }
      program_to_save[:texts] = 'new_texts'
      expect(Repos::Programs).to receive(:modify).with(program_to_save)
      post modify_program_route, program_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['program']).to include(Util.stringify_hash(program_to_save))
    end

    it 'modifies the program if admin' do
      post logout_route
      post login_route, admin_user
      program_to_save[:subcategories] = {
        'artist' => 'new_artist', 
        'space' => 'new_space'
      }
      program_to_save[:texts] = 'new_texts'
      expect(Repos::Programs).to receive(:modify).with(program_to_save)
      post modify_program_route, program_to_save
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['program']).to include(Util.stringify_hash(program_to_save))
      
    end


  end


  describe 'delete_progam' do

    before(:each){
      post logout_route
      post login_route, admin_user
      Repos::Events.save({id: event_id, user_id: user_id, program_id: program_id})
    }
    
    # it 'fails if program has activities' do
    #   Repos::Programs.modify(id: program_id, activities: ['activity_id'])
    #   post delete_program_route, {id: program_id}
    #   expect(parsed_response['status']).to eq('fail')
    #   expect(parsed_response['reason']).to eq('program_has_activities')
    # end

    it 'deletes all the activities of the program' do
      expect(Repos::Activities).to receive(:delete_many).with({program_id: program_id})
      post delete_program_route, {id: program_id}
    end

    it 'deletes the program' do
      expect(Repos::Programs).to receive(:delete).with(program_id)
      post delete_program_route, {id: program_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'removes program_id from event' do
      expect(Repos::Events).to receive(:unset).with(event_id, {program_id:""}).and_call_original
      post delete_program_route, {id: program_id}
      expect(Repos::Events.get_by_id(event_id)[:program_id]).to eq(nil)
    end

  end


  describe 'Publish' do

  	it 'fails if program does not exist' do
  		post publish_route, {id: 'otter', event_id: event_id}
  		expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_program')
  	end

   	it 'fails if not program owner or admin' do
   		post logout_route
   		post login_route, other_user
			post publish_route, {id: program_id, event_id: event_id}
  		expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('program_ownership')
  	end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post publish_route, {id: program_id, event_id: event_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post logout_route
      post login_route, admin_user
      post publish_route, {id: program_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end


  	it 'publishes the program' do
  		post publish_route, {id: program_id, event_id: event_id}
  		expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(true)
  	end


  	it 'unpublishes the program' do
			post publish_route, {id: program_id, event_id: event_id}
      post publish_route, {id: program_id, event_id: event_id}
  		expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(false)
  	end


  end

  describe 'Order space' do

  	it 'fails if program does not exist' do
  		post space_order_route, {id: 'otter', event_id: event_id, order: ['sp1', 'sp2', 'sp3']}
  		expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_program')
  	end

   	it 'fails if not program owner or admin' do
   		post logout_route
   		post login_route, other_user
			post space_order_route, {id: program_id, event_id: event_id, order: ['sp1', 'sp2', 'sp3']}
  		expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('program_ownership')
  	end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post space_order_route, {id: program_id, event_id: event_id, order: ['sp1', 'sp2', 'sp3']}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post logout_route
      post login_route, admin_user
      post space_order_route, {id: program_id, event_id: event_id, order: ['sp1', 'sp2', 'sp3']}
      expect(parsed_response['status']).to eq('success')
    end

		
  	it 'saves the order of the space' do
  		post space_order_route, {id: program_id, event_id: event_id, order: ['sp1', 'sp2', 'sp3']}
  		expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(['sp1', 'sp2', 'sp3'])
  	end


	end

  describe 'save_subcategories_price' do

    let(:subcat_price){
      {
        '1':{price: '11', ticket_url:'www.ticket.url'}, 
        '2':{price: '22', ticket_url: 'www.ticket2.url'}
      }
    }

    before(:each){
      Repos::Activities.save({program_id: program_id, price: '150', participant_proposal_id: 'proposal_id'})
      Repos::Activities.save({program_id: program_id, price: '1', participant_proposal_id: 'proposal_id'})
      Repos::Artistproposals.save({id: 'proposal_id', event_id: event_id, subcategory: '2'})
      Repos::Artistproposals.save({id: 'other_proposal_id', event_id: event_id, subcategory: '3'})
    }

    
    it 'saves the prices of the categories of the program' do
      expect(Repos::Programs).to receive(:modify).once.with(hash_including(subcategories_price: Util.stringify_hash(subcat_price))).and_call_original
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => subcat_price}
      expect(Repos::Programs.get_by_id(program_id)[:subcategories_price]).to eq(subcat_price)
    end

    it 'returns the prices of the categories' do
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => subcat_price}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(subcat_price))
    end

    it 'assigns the price to the activities of the subcategory' do
      expect(Repos::Activities).to receive(:modify_many).once.with({participant_proposal_id: 'proposal_id'}, {:price=>{'price'=> '22', 'ticket_url'=> 'www.ticket2.url'}})
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => subcat_price}

      Repos::Artistproposals.save({id: 'otter_proposal_id', event_id: event_id, subcategory: '1'})
      expect(Repos::Activities).to receive(:modify_many).twice.and_call_original
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => subcat_price}

      activities = Repos::Activities.all
      expect(activities.all?{|a| a[:price][:price] == '22'&& a[:price][:ticket_url] == 'www.ticket2.url'}).to eq(true)
    end


    it 'update the price only of the prices just changed' do
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => subcat_price}

      Repos::Artistproposals.save({id: 'otter_proposal_id', event_id: event_id, subcategory: '1'})
      expect(Repos::Activities).to receive(:modify_many).once.with({participant_proposal_id: 'other_proposal_id'}, {:price=>{'price'=>'23', 'ticket_url' => "t3url"}})
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => {'3' => {'price'=>'23', 'ticket_url' => "t3url"}}}
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => {'3' => {'price'=>'23', 'ticket_url' => "t3url"}}}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post logout_route
      post login_route, admin_user
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => {'3' => {'price'=>'23', 'ticket_url' => "t3url"}}}
      expect(parsed_response['status']).to eq('success')
    end



  end


  describe 'set_permanents' do

    let(:permanents){
      [
        {date:'d1', time:['t1','t2'], subcategories: ['1']}, {date:'d2', time:['t3','t4'], subcategories: ['4']}
      ]
    }

    before(:each){
      Repos::Activities.save({id:activity_id, program_id: program_id, host_id: 'host_id', participant_id: 'participant_id', permanent: 'false', dateTime: [{date: 'd', time:['t','tt']}]})
      Repos::Activities.save({id: permanent_activity_id,program_id: program_id, host_id: 'h_id', participant_id: 'participant_id', permanent: 'true', dateTime: [{date: 'd', time:['t','tt']}], participant_proposal_id: 'artist_proposal_id'})
      Repos::Activities.save({id: permanent_activity_id_2,program_id: program_id, host_id: 'h_id', participant_id: 'participant_id', permanent: 'true', dateTime: [{date: 'd', time:['t','tt']}], participant_proposal_id: 'otter_artist_proposal_id'})
      Repos::Artistproposals.save({id: 'artist_proposal_id', subcategory: '1'})
      Repos::Artistproposals.save({id: 'otter_artist_proposal_id', subcategory: '3'})
    }

    
    it 'saves permanents params in the program' do
      expect(Repos::Programs).to receive(:modify).once.and_call_original
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      expect(Repos::Programs.get_by_id(program_id)[:permanents]).to eq(permanents)
    end

    it 'raise error when permanents blank and there exists permanent activities in the program' do
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => []}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_permanent_activities')
    end

    it 'assigns the time to all permanent activities of the program if subcategories is null' do
      permanents = [
        {date:'d1', time:['t1','t2']}, {date:'d2', time:['t3','t4']}
      ]
      expect(Repos::Activities).to receive(:modify).twice.and_call_original
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      permanent_activity = Repos::Activities.get_by_id permanent_activity_id
      expect(permanent_activity[:dateTime].map{|dt| dt[:date]}).to eq(permanents.map{|dt| dt[:date]})
    end

    it 'assigns the time to all permanent activities of the corresponding subcategories' do
      expect(Repos::Activities).to receive(:modify).once.and_call_original
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      permanent_activity = Repos::Activities.get_by_id permanent_activity_id
      expect(permanent_activity[:dateTime].map{|dt| dt[:date]}).to eq(['d1'])
      permanent_activity_2 = Repos::Activities.get_by_id permanent_activity_id_2
      expect(permanent_activity_2[:dateTime].map{|dt| dt[:date]}).to eq(['d'])
    end


    it 'returns the permanents time' do
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']['permanents']).to eq(permanents.map{|dt|Util.stringify_hash(dt)})
    end


    it 'returns the permanent modified activities arranged with id_time' do
      post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']['activities'].length).to eq(1)
      expect(parsed_response['model']['activities'].map{|a|a['id']}.uniq).to eq([permanent_activity_id])
      expect(parsed_response['model']['activities'].map{|a|a['id_time']}.uniq.length).to eq(1)
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
       post set_permanents_route, {'id' => program_id, 'event_id'=> event_id, 'permanents' => permanents}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2276, 05, 02))
      post logout_route
      post login_route, admin_user
      post save_subcategories_price_route, {'id' => program_id, 'event_id'=> event_id, 'subcategories_price' => {'3' => {'price'=>'23', 'ticket_url' => "t3url"}}}
      expect(parsed_response['status']).to eq('success')
    end



  end



end