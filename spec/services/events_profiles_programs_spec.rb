describe 'Services Events / Profiles / Programs' do

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
      name: 'participant artist',
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
      name: 'host artist',
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




   let(:artist){
    {
      # user_id: user_id,
      profile_id: profile_id,
      email: 'contact_email@test.com',
      name: 'name',
      address: {:postal_code => '46020', :locality => 'city'},
      phone: { :visible => 'false', :value => 'phone'},
      proposals: [{
        production_id: production_id,
        proposal_id: proposal_id,
        date: 6002054000000,
        selected: true,
        category: 'music',
        format:'concert',
         subcategory: 'music',
        form_id: 'music',
        title: 'title',
        description: 'description',
        short_description: 'short_description',
        duration: 'duration',
        # '1': nil,
        '2': 'mandatory',
        photos: ['picture.jpg', 'otter_picture.jpg'],
      }]
    }
  }


    let(:artistproposal){
    {
      id: proposal_id,
      profile_id: profile_id,
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
      title: 'title',
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
      space_name: 'space_name',
      address: 'address',
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
        {date: '2019-04-25', time:['10', '14'] },
        {date: '2019-04-26', time:['17', '23'] }
      ],
      permanent: 'false',
    }
  }

    let(:program){
    {
      id: program_id,  
      event_id: event_id, 
      activities: [activity_id], 
      participants: [participant_id], 
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
      ]
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
      participants: [participant_id, profile_id],
      forms: {
        es:{
          artist: {
            music: {
              blocks: {
                title: {type: "mandatory"},
                # format: {type: "mandatory"},
                description: {type: "mandatory"},
                short_description: {type: "mandatory"},
                duration: {type: "mandatory"},
                '1': {type: "optional"},
                '2': {type: "mandatory"},
                category: {type:'mandatory'},
                form_id: {type: "mandatory"},
                subcategory: {type: "mandatory"},
                photos: {type: "optional"}
              }
            }
          },
          space: {
            home: {
              blocks: {
                '1': {type: "optional"},
                '2': {type: "mandatory"},
                ambient_info:{
                  capacity:{type:"mandatory"}
                }
              }
            }
          }
        }
      }
    }
  }


  before(:each){
    Repos::Programs.save program
    Repos::Events.save event
    Repos::Calls.save call
    Repos::Artistproposals.save artistproposal
    Repos::Spaceproposals.save spaceproposal
    Repos::Profiles.save profile
    Repos::Profiles.save participant_profile
    Repos::Profiles.save host_profile
    Repos::Activities.save activity_saved
  }


  describe 'Profiles.get_history' do

    it 'retrieves my proposals' do
      allow(Time).to receive(:now).and_return(Time.new(2018,1,1))
      artistproposal[:event_name] = event[:name]
      artistproposal[:deadline] = call[:deadline]
      artistproposal[:color] = profile[:color]
      history = Services::Profiles.get_history profile_id
      expect(history).to include(call_proposals: {artist: [artistproposal]})
    end


  end

  describe 'Profiles.get_upcoming' do

  it 'retrieves my future program' do
    allow(Time).to receive(:now).and_return(Time.new(2018,1,1))
    activity_saved[:title] = artistproposal[:title]
    activity_saved[:order] = 0
    activity_saved[:host_subcategory] = spaceproposal[:subcategory]
    expect(Services::Profiles.get_upcoming(participant_id)[:activities]).to include(hash_including(
      { event_id: event[:id],
        event_name: event[:name],
        date: "2019-04-26"
        }))
    activity_saved[:date] = activity_saved[:dateTime][0][:date]
    activity_saved[:time] = activity_saved[:dateTime][0][:time]
    activity_saved.except!(
      :dateTime, 
      :comments, 
      :dateTime, 
      :host_proposal_id, 
      :participant_proposal_id,
      :program_id,
      :confirmed,
      :event_id
    )
    expect(Services::Profiles.get_upcoming(participant_id)[:activities][0][:shows]).to include(hash_including(
      activity_saved))
  end
  
  end


  describe 'Profiles.update_participations' do

    it 'turns profile into particpants and proposal to own if profile is deleted' do
      Services::Profiles.update_participations profile_id
      artistproposal[:own] = true
      expect(Repos::Artistproposals.get(profile_id: profile_id).first).to eq(artistproposal)
      expect(MetaRepos::Participants.get_by_id  profile_id).to include(name: profile[:name], facets: profile[:facets], color: profile[:color])
    end

  end

  describe 'Programs.arrange_program' do

    it 'makes up all the activities of a program' do
      expect(Repos::Programs).to receive(:get_by_id).with(program_id).and_call_original
      program = Services::Programs.arrange_program program_id
      activity_saved[:order] = 0
      activity_saved[:host_name] = spaceproposal[:space_name]
      activity_saved[:participant_name] = participant_profile[:name]
      activity_saved[:date] = activity_saved[:dateTime][0][:date]
      activity_saved[:time] = activity_saved[:dateTime][0][:time]
      activity_saved.except!(
        :dateTime, 
        :comments, 
        :dateTime, 
        :host_proposal_id, 
        :participant_proposal_id,
        :program_id,
        :confirmed,
        :event_id
      )
      expect(program).to include(hash_including(activity_saved))
    end

  end

end