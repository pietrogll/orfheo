describe 'Services Search' do

  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:proposal_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:program_id){'a1100000-8f02-4542-a1c9-7f7aa18752ce'}
  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:host_id){'00bc4203-0079-00e0-006a-00e1e5f3fac6'}
  let(:host_proposal_id){'00bc4203-0079-00e0-006a-00e1e5f3fa96'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:space_id){'096a9bdd-ecac-4237-9740-c8ae7a5864e3'}
  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:participant_id){'8c41cf77-32b0-4df2-9376-0960e64a0000'}

  let(:activity_id){'8c41cf77-32b0-4df2-9376-0960e64a2222'}
  let(:otter_activity_id){'8c41cf77-32b0-4df2-9376-0960e64a3333'}
  let(:other_activity_id){'8c41cf77-32b0-4df2-9376-0960e64a4444'}
  



  let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: 'facet',
      tags: nil,
      name: 'name',
      email: {:visible => 'false', :value => "contact_email@test.com"},
      profile_picture: ['profile_picture.jpg'],
      address: {:postal_code => '46020', :locality => 'city'},
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone:  { :visible => 'false', :value => 'phone'},
      buttons: [{:text => 'text_button', :links => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []
    }
  }



  let(:participant_profile){
    {
      user_id: user_id,
      id: participant_id,
      facets: 'facet',
      tags: nil,
      name: 'participant profile',
      email: {:visible => 'false', :value => "contact_email@test.com"},
      profile_picture: ['profile_picture.jpg'],
      address: {:postal_code => '46020', :locality => 'city'},
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone:  { :visible => 'false', :value => 'phone'},
      buttons: [{:text => 'text_button', :links => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []
    }
  }

  let(:host_profile){
    {
      user_id: user_id,
      id: host_id,
      facets: 'facet',
      tags: nil,
      name: 'host profile',
      email: {:visible => 'false', :value => "contact_email@test.com"},
      profile_picture: ['profile_picture.jpg'],
      address: {:postal_code => '46020', :locality => 'city'},
      description: nil,
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone:  { :visible => 'false', :value => 'phone'},
      buttons: [{:text => 'text_button', :links => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []
    }
  }


    let(:artistproposal){
    {
      id: proposal_id,
      profile_id: participant_id,
      event_id: event_id,
      call_id: call_id,
      user_id: user_id,
      production_id: production_id,
      subcategory: 'music',
      form_id: 'music',
      date: 6002054000000,
      selected: true,
      category: 'music',
      format:'concert',
      title: 'my_title',
      short_description: 'short_description',
      description: 'description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      # '1': nil,
      '2': 'mandatory'
     }
  }

    let(:spaceproposal){
    {
      id: host_proposal_id,
      profile_id: host_id,
      event_id: event_id,
      call_id: call_id,
      space_id: space_id,
      user_id: user_id,
      subcategory: 'home',
      form_id: 'home',
      space_name: 'my_space_name',
      address: {'locality' => 'address locality'},
      type: 'space_type',
      description:'space_description',
      plane_picture: ['plane_picture.jpg'],
      date: 1462054000, 
      selected: true,
      single_ambient: 'true',
      ambients:[{
        name: 'ambient_name',
        description:'ambient_description',
        allowed_categories: ['music'],
        allowed_formats:['concert'],
        capacity: '12',
        photos: ['ambient_picture.jpg']
        }],
      # '1': nil,
      '2': 'mandatory'
    }
  }


  let(:activity_saved){
    {
      id: activity_id,
      participant_id: participant_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: host_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      dateTime:[
        {date: '2016-10-15', time:['1476518400000', '1476532800000']},
        {date: '2016-10-15', time:['1476543600000', '1476565200000']},
        {date: '2016-10-16', time:['1476604800000', '1476615600000'] }
      ],
      permanent: 'false',
    }
  }

  let(:otter_activity_saved){
    {
      id: otter_activity_id,
      participant_id: participant_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: host_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      dateTime:[
        {date: '2016-10-16', time:['1476604800000', '1476610000000'] }],
      permanent: 'false',
    }
  }

  let(:other_activity_saved){
    {
      id: other_activity_id,
      participant_id: participant_id,
      host_id: host_id,
      participant_proposal_id: proposal_id,
      host_proposal_id: host_proposal_id,
      space_id: space_id,
      event_id: event_id,
      program_id: program_id,
      dateTime:[
        {date: '2016-10-15', time:[ '1476518400000', '1476532800000']}
      ],
      permanent: 'true',
    }
  }

    let(:program){
    {
      id: program_id,  
      event_id: event_id, 
      activities: [activity_id, otter_activity_id, other_activity_id], 
      participants: [participant_id, host_id], 
      order: [host_proposal_id], 
      published: true, 
      price: nil, 
      ticket_url: nil
    }
  }


  
  let(:event){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: event_id,
      program_id: program_id,
      call_id: call_id,
      name: 'event_name',
      eventTime: [
        {
          "date": "2019-04-25",
          "time": [ 
            "1493136000000", 
            "1493157600000"
          ]
        },
        {
          "date": "2019-04-26",
          "time": [ 
            "1493222400000", 
            "1493244000000"
          ]
        }
      ],
      participants: [participant_id, profile_id, host_id]
    }
  }

  let(:otter_event){
    {
      profile_id: profile_id,
      id: event_id,
      program_id: program_id,
      call_id: call_id,
      name: 'otter_event_name',
    }
  }


  let(:other_event){
    {
      profile_id: profile_id,
      id: event_id,
      program_id: program_id,
      call_id: call_id,
      name: 'other_event_name',
    }
  }




  before(:each){
    Repos::Programs.save program
    Repos::Events.save event
    Repos::Events.save otter_event
    Repos::Events.save other_event
    Repos::Artistproposals.save artistproposal
    Repos::Spaceproposals.save spaceproposal
    Repos::Profiles.save profile
    Repos::Profiles.save participant_profile
    Repos::Profiles.save host_profile
    Repos::Activities.save activity_saved
    Repos::Activities.save otter_activity_saved
    Repos::Activities.save other_activity_saved
  }


  
  describe 'get_program_suggestions' do

    it 'suggets tags looking for activity title' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my_t'], {})
      expect(suggestions).to include(hash_including({type: "title", text:"my_title"}))
    end

    it 'suggets tags looking for host_name (spaceproposal space_name)' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my_spa'], {})
      expect(suggestions).to include(hash_including({type: "name", text:"my_space_name"}))
    end

    it 'suggets tags looking for participant_name (artist profile)' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['part'], {})
      expect(suggestions).to include(hash_including({type: "name", text:"participant profile"}))
    end

    it 'suggets tags looking for locality (address - spaceproposal)' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['ad'], {})
      expect(suggestions).to include(hash_including({type: "city", text:"address locality"}))
    end

    it 'suggets mutliple tags' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my'], {})
      expect(suggestions).to include(hash_including({type: "title", text:"my_title"}), hash_including({type: "name", text:"my_space_name"}))
    end

    it 'suggets tags considering hosts (host_subcategory) filter' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my'], {hosts: 'home'})
      expect(suggestions).to include(hash_including({type: "title", text:"my_title"}), hash_including({type: "name", text:"my_space_name"}))
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my'], {hosts: 'ass'})
      expect(suggestions).to eq []
    end

    it 'suggests tags considering participants (participant_subcategory) filter' do
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my'], {participants: 'music'})
      expect(suggestions).to include(hash_including({type: "title", text:"my_title"}), hash_including({type: "name", text:"my_space_name"}))
      suggestions = Services::Search.get_program_suggestions('es', event_id, ['my'], {participants: 'workshop'})
      expect(suggestions).to eq []
    end

  end

  describe 'get_program_results' do

    it 'returns activities a specific day if day passed as param' do
      program = Services::Search.get_program_results 'es', event_id, [], {}, '2016-10-16', nil
      expect(program.map{|act| act[:id]}).to eq [otter_activity_saved[:id], activity_saved[:id]]
    end

    it 'returns activities that are happing now if time passed as param' do
      program = Services::Search.get_program_results 'es', event_id, [], {}, '2016-10-16', '1476612000000'
      expect(program.map{|act| act[:id]}).to eq [activity_saved[:id]]
    end

  end

end

