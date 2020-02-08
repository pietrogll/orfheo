describe 'get_public_info for Events' do

  let(:event_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb80'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:tag_id){'fff01c94-4a2b-49ff-b6b6-dfd53e45bb81'}
  let(:otter_tag_id){'eee01c94-4a2b-49ff-b6b6-dfd53e45bb82'}
  let(:other_tag_id){'ccc01c94-4a2b-49ff-b6b6-dfd53e45bb83'}

  let(:event){
    {
      user_id: 'user_id',
      profile_id: profile_id,
      id: event_id,
      program_id: 'program_id',
      call_id: 'call_id',
      name: 'event_name',
      texts: 'texts',
      img: ['picture.jpg'],
      professional: false,
      categories: {},
      type: 'event_type',
      place: 'lugar',
      address: 'dirección',
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

  let(:profile){
    {
      id: profile_id,
      name: "profile_name",
      color: "profile_color"
    }
  }

  
  before(:each){
    Repos::Events.save event
    Repos::Profiles.save profile
  }

  describe 'get_public_info' do

    let(:wanted_keys){ [:profile_id, :id, :name, :texts, :img, :profile_name, :color, :professional, :eventTime, :address, :categories, :place, :type] }

    it 'retrieves all the wanted_keys' do
      event = Services::DbElement.get_public_info :events, event_id
      
      expect( event.keys.sort ).to eq(wanted_keys.sort)
    end

  end

end
