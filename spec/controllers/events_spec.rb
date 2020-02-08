describe EventsController do

  include_examples 'http_methods'
  include_examples 'ids'  
  include_examples 'db_elements'  

  let(:event){
    {
      user_id: user_id,
      profile_id: profile_id,
      call_id: call_id,
      program_id: program_id, 
      name: 'event_name',
      type: 'festival',
      texts: {
        'es'=>{
          'baseline' => 'bln'
        }
      },
      img: ['event_img.jpg'],
      place: 'place',
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
      categories: ['music'],
      id: event_id,
      professional: false
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
      texts: {es: 'call_texts'},
      forms: [form_id, 'form_id_2', 'form_id_3', 'form_id_4']
    }
  }


  let(:artist_form_1){
    {
      id: form_id,
      call_id: call_id,
      user_id: user_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: {label: 'label'}
      },
      own: 'own',
      "widgets"=>{}
    }
  }


  let(:artist_form_2){
    {
      id: 'form_id_2',
      call_id: call_id,
      user_id: user_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: 'texts'
      },
      widgets: {es:{wk: 'wv'}}
    }
  }


  let(:space_form_1){
    {
      id: 'form_id_3',
      call_id: call_id,
      user_id: user_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      },
      "widgets"=>{}
    }
  }

  let(:space_form_2){
    {
      id: 'form_id_4',
      call_id: call_id,
      user_id: user_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      },
      own:'private',
      "widgets"=>{}
    }
  }

  let(:forms){
    {
      artist:{
        form_id => {
            'blocks' => artist_blocks[:es],
            'texts' => {label: 'label'},
            "type"=>"artist", 
            "form_id"=> form_id,
            "widgets"=>{}
          },
        "form_id_2" => {
            'blocks' => artist_blocks[:es],
            'texts' => 'texts',
            "type"=>"artist", 
            "form_id"=>"form_id_2",
            "widgets"=> {'wk' =>'wv'}
          }
      },
      space:{
        "form_id_3" => {
            'blocks' => space_block[:es],
            'texts' => 'texts',
            "type"=>"space", 
            "form_id"=>"form_id_3",
            "widgets"=>{} 
          },
        "form_id_4" => {
            'blocks' => space_block[:es],
            'texts' => 'texts',
            "type"=>"space", 
            "form_id"=>"form_id_4",
            "widgets"=>{}
          }
      }
    }
  }


  # let(:params){{event_id: event_id, program: []}}

  before(:each){
    ApiStorage.repos(:users).save user
    Repos::Users.save other_user
    Repos::Users.save admin_user
    Repos::Profiles.save profile
    Repos::Programs.save program
    Repos::Calls.save call
    MetaRepos::Admins.save admin
    Repos::Events.save event
    allow(SecureRandom).to receive(:uuid).and_return(performance_id)
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user

  }

  describe 'Retrieve' do

    it 'retrieves all events' do
      expect(Services::Events).to receive(:get_events).and_call_original
      get '/events'
      expect(parsed_response['status']).to eq('success')
    end

    it 'retrieves all events even if profile deleted' do
      post '/users/delete_profile', {id: profile_id}
      expect(MetaRepos::Participants).to receive(:get_by_id).and_call_original
      get '/events'
      expect(parsed_response['status']).to eq('success')
    end

  end

  describe 'Create event' do

    before(:each){
      Repos::Events.delete event_id
    }

    it 'fails if not the owner of the profile nor the admin' do
      event[:profile_id] = 'other_profile_id'
      post create_event_route, event
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if the name does not exist' do
      event[:name] = ''
      post create_event_route, event
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'creates an event' do
      expect(Repos::Events).to receive(:save).with(event)
      post create_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    context 'when it is a admin' do
      before do
        event[:professional] = true
        post logout_route
        post login_route, admin_user
      end
      it 'creates an event if admin' do
        expect(Repos::Events).to receive(:save).with(event)
        post create_event_route, event
        expect(parsed_response['status']).to eq('success')
        expect(parsed_response['event']).to include(Util.stringify_hash(event))
      end
      
      it 'makes professional an event if admin and params[:professional]=true' do
        expect(Repos::Events).to receive(:save).with(event)
        post create_event_route, event
        expect(parsed_response['status']).to eq('success')
        expect(parsed_response['event']).to include(Util.stringify_hash(event))
      end

    end

    it 'creates an event if generic user' do
      post logout_route
      post login_route, user
      expect(Repos::Events).to receive(:save).with(event)
      post create_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    
    it 'does not make professional if NOT admin' do
      post logout_route
      post login_route, user
      event[:professional] = true
      savedEvent = event.clone
      savedEvent[:professional] = false
      expect(Repos::Events).to receive(:save).with(savedEvent)
      post create_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(savedEvent))
    end

    it 'creates the corresponding gallery' do
      expect(Actions::UserCreatesGallery).to receive(:run).with(event, 'events').and_call_original
      expect(MetaRepos::Galleries).to receive(:save).once
      post create_event_route, event
    end

    it 'creates the corresponding assets' do
      expect(Services::Assets).to receive(:create).once.and_call_original
      expect(MetaRepos::Assets).to receive(:save).once
      post create_event_route, event
    end

  end

  describe 'Modifies event' do

    before do
      event.delete(:professional)
    end

    it 'fails if the event does not exist' do
      Repos::Events.delete event_id
      post modify_event_route, event
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_event')
    end

    it 'modifies an event' do
      event[:name] = 'otter_name'
      expect(Repos::Events).to receive(:modify).with(event)
      post modify_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    it 'updates the corresponding gallery' do
      event[:img] = ['new_image']
      expect(Actions::UserUpdatesGallery).to receive(:run).with(event, 'events').and_call_original
      post modify_event_route, event
    end

    it 'calls gallery services' do
      event[:img] = ['new_image']
      expect(Services::Gallery).to receive(:update_pictures).once
      post modify_event_route, event
    end  


    it 'modifies an event if admin' do
      post logout_route
      post login_route, admin_user
      event[:name] = 'otter_name'
      event[:professional] = false
      expect(Repos::Events).to receive(:modify).with(event)
      post modify_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    it 'modifies an event if owner' do
      post logout_route
      post login_route, user
      event[:name] = 'otter_name'
      expect(Repos::Events).to receive(:modify).with(event)
      post modify_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    it 'does not modify an event if NOT owner NOR admin' do
      post logout_route
      post login_route, other_user
      event[:name] = 'otter_name'
      post modify_event_route, event
      expect(parsed_response['status']).to eq('fail')
    end

    it 'makes the event professional is admin and params[:professional]=true' do
      post logout_route
      post login_route, admin_user
      event[:professional] = true
      expect(Repos::Events).to receive(:modify).with(event)
      post modify_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['event']).to include(Util.stringify_hash(event))
    end

    it 'make event NOT professional if admin and params[:professional]!= true' do
      Repos::Events.modify({id: event_id, professional: true})
      post logout_route
      post login_route, admin_user
      event[:professional] = false
      expect(Repos::Events).to receive(:modify).with(event).and_call_original
      post modify_event_route, event
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Events.get_by_id(event_id)[:professional]).to eq(false)
    end

    it 'does not allow to modify an event you don"t own' do
      post logout_route
      post login_route, other_user
      post modify_event_route, event
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end


  end


  describe 'delete_event' do

    before(:each){
     post create_event_route, event  
    }

    it 'fails if event is professional' do
      Repos::Events.modify({id: event_id, professional: true})
      post delete_event_route, {id: event_id}
      expect(parsed_response['status']).to eq('fail')
    end

    it 'deletes the event, the associated gallery and the partners pictures' do
      expect(Services::Gallery).to receive(:update_pictures).once.with(event_id).and_call_original
      expect(Cloudinary::Api).to receive(:delete_resources).with(['event_img.jpg'])
      expect(Services::Gallery).to receive(:compare_and_delete_unused_pictures).once
      expect(Repos::Events).to receive(:delete).with(event_id)
      post delete_event_route, {id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'for a professional event, deletes the event, the call and the program if admin' do
      Repos::Events.modify({id: event_id, professional: true})
      post logout_route
      post login_route, admin_user

      expect(Repos::Calls).to receive(:delete).with(call_id)
      expect(Repos::Programs).to receive(:delete).with(program_id)
      expect(Repos::Events).to receive(:delete).with(event_id)

      post delete_event_route, {id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

  end


  describe 'Update partners' do

    let(:partners_params){
      {
        id: event_id,
        partners: {
          sponsors: [{img: 'sp1.jpg'},{img: 'sp2.jpg'}],
          collaborators: [{img: 'col1.jpg'}]
        }
      }
    }

    it 'modifies event partners' do
      expect(Repos::Events).to receive(:modify).with({id: event_id, partners: Util.stringify_hash(partners_params[:partners])}).and_call_original
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      post update_partners_route, partners_params
      expect(Repos::Events.get_by_id(partners_params[:id])).to include(partners: partners_params[:partners])
    end

    it 'deletes img of deleted partners' do
      post update_partners_route, partners_params
      expect(Cloudinary::Api).to receive(:delete_resources).with(['sp1.jpg', 'sp2.jpg','col1.jpg'])
      post update_partners_route, {id: event_id, partners: nil}
    end

    it 'deletes modified img' do
      post update_partners_route, partners_params
      expect(Cloudinary::Api).to receive(:delete_resources).with(['sp1.jpg'])
      post update_partners_route, {id: event_id, partners: {
          sponsors: [{img: 'sp2.jpg'}],
          collaborators: [{img: 'col1.jpg'}]
        }}
    end

  end


  describe 'Access event page' do
    
    let(:event_route){'/event?id=' + event_id}

    before(:each){
       Repos::Events.modify({id: event_id, professional: true})
    }

    it 'fails if the event does not exist' do
      get '/event?id=otter'
      expect(last_response.body).to include('Not Found')
    end

    it 'fails if the event is not professional' do
      Repos::Events.modify({id: event_id, professional: false})
      get event_route
      expect(last_response.body).to include('Not Found')
    end

    it 'retrieves the event' do
      expect(Actions::UserGetsEvent).to receive(:run).with(user_id, event_id, user[:lang]).and_return({user_id: user_id})
      get event_route
    end

    it 'if the event is professional, it retrieves the event even when profile owner is deleted' do
      post '/users/delete_profile', {id: profile_id}
      expect(Actions::UserGetsEvent).to receive(:run).with(user_id, event_id, user[:lang]).and_return({user_id: user_id}).and_call_original
      expect(MetaRepos::Participants).to receive(:get_by_id).with(profile_id).and_call_original
      get event_route
    end

  end

  describe 'Event Manager' do

    let(:manager_route){'/event_manager?id=' + event_id}
    let(:event_manager){'/users/event_manager'}

    before(:each){
      Repos::Forms.save artist_form_1
      Repos::Forms.save artist_form_2
      Repos::Forms.save space_form_1
      Repos::Forms.save space_form_2
    }

    it 'redirects user to not found page if event does not exist' do
      get '/event_manager?id=otter'
      expect(last_response.body).to include('Not Found')
    end

    it 'redirects user to not found page if not owner of the call' do
      post logout_route
      post login_route, other_user
      get manager_route
      expect(last_response.body).to include('Not Found')
    end

    it 'grants access to the owner' do
      expect(Repos::Events).to receive(:get_owner).with(event_id).and_return(user_id)
      get manager_route
      expect(last_response.body).to include('Pard.EventManager')
    end

    it 'gets the event_manager info' do
      expect(Repos::Events).to receive(:get_by_id).twice.with(event_id).and_call_original
      expect(Repos::Profiles).to receive(:get_by_id).with(profile_id).and_call_original
      expect(Repos::Artistproposals).to receive(:get).with({event_id: event_id}).and_call_original
      expect(Repos::Spaceproposals).to receive(:get).with({event_id: event_id}).and_call_original
      expect(Services::Programs).to receive(:make_up_program_with).and_call_original
      post event_manager, {event_id: event_id, lang: 'es'}
      expect(parsed_response['the_event']).to include({'user_id' => user_id, 'call_id' => call_id, 'organizer_phone'=>{'value'=>'phone', 'visible'=> 'false'},'organizer_email'=>'contact_email@test.com', 'program' => [], 'artists'=> [], 'spaces'=> [], 'whitelist'=> [] })
      expect(parsed_response['forms']).to include(Util.stringify_hash(forms))
    end
  end

  describe 'Slug' do
    let(:otter_event){
      {
        id: 'otter_event_id',
        user_id: user_id,
        name: 'event_name',
        artists: [{profile_id: profile_id}],
        spaces: [{profile_id: host_id}],
        texts:{'es':{}}
      }
    }
    before(:each){
      @db['events'].insert_one(otter_event)
      Repos::Events.modify({id: event_id, professional: true})
    }

    it 'adds a slug to the event' do
      post slug_route, {event_id: event_id, slug: 'slug'}
      expect(parsed_response['status']).to eq('success')
    end

    it 'gets an event by its slug' do
      post slug_route, {event_id: event_id, slug: 'slug'}
      get '/event/slug'
      expect(last_response.body).to include('Pard.Event')
    end

    it 'redirects to welcome if unexisting slug' do
      get '/event/slug'
      expect(last_response.headers).to include({'Location' => '/'})
    end

    it 'redirects to Not Found if event is not professional' do
      post slug_route, {event_id: event_id, slug: 'slug'}
      Repos::Events.modify({id: event_id, professional: false})
      get '/event/slug'
      expect(last_response.body).to include('Not Found')
    end

    it 'checks if valid slug' do
      post '/users/check_slug', {event_id: event_id, slug: 'sl'}
      expect(parsed_response['available']).to eq(false)
      post '/users/check_slug', {event_id: event_id, slug: 'sluG'}
      expect(parsed_response['available']).to eq(false)
      post '/users/check_slug', {event_id: event_id, slug: 'slug'}
      expect(parsed_response['available']).to eq(true)
    end

    it 'rejects if invalid slug' do
      post slug_route, {event_id: event_id, slug: 'sl'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_slug')
      post slug_route, {event_id: event_id, slug: 'slug/'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_slug')
      post slug_route, {event_id: event_id, slug: 'slugox008cii'}
      expect(parsed_response['status']).to eq('success')
    end

    it 'rejects if replacing slug' do
      post slug_route, {event_id: event_id, slug: 'slug'}
      expect(parsed_response['status']).to eq('success')
      post slug_route, {event_id: event_id, slug: 'slug'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('slug_in_use')
    end

    it 'rejects if repeated slug' do
      post slug_route, {event_id: event_id, slug: 'slug'}
      post slug_route, {event_id: 'otter_event_id', slug: 'slug'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_slug')
    end
  
  end

  
end
