describe Repos::Events do 

  let(:user_id){'45825599-b8cf-499c-825c-a7134a3f1ff0'}
  let(:otter_user_id){'45825599-b8cf-499c-825c-a7134a3f0000'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e450000'}  
  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:otter_event_id){'a5bc4203-9379-4de0-856a-55e1e5f30000'}

  
  let(:event){
    {
      user_id: user_id,
      profile_id: profile_id,
      id: event_id,
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

  let(:otter_event){
    {
      user_id: otter_user_id,
      profile_id: otter_profile_id,
      id: otter_event_id,
      name: 'otter_event_name',
      eventTime: [
        {
         "date": "2017-04-25",
         "time": [ 
            "1493136000000", 
            "1493157600000"
          ],
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


  before(:each){
    @db['events'].insert_one(event)
    @db['events'].insert_one(otter_event)
  }

  describe 'Get' do

    it 'retrieves the owner of the event' do
      expect(Repos::Events.get_owner(event_id)).to eq(user_id)
    end

    it 'retrieves the event' do
      expect(Repos::Events.get_by_id event_id).to include({
        user_id: user_id,
        id: event_id
      })
    end
  end

  describe 'Exists?' do
    it 'checks if matched element is already in any document' do
      expect(Repos::Events.exists? event_id).to eq(true)
      expect(Repos::Events.exists? 'otter').to eq(false)
    end

    it 'checks if matched element is already in any document' do
      Repos::Events.add_slug event_id, 'slug'
      expect(Repos::Events.slug_exists? 'slug').to eq(true)
      expect(Repos::Events.slug_exists? 'otter').to eq(false)
    end
  end


  # describe 'Participants' do

  #   before(:each){
  #   }

  #   it 'adds a participant' do
  #   end

  #   it 'updates a_participant' do
  #   end

  #   it 'deletes a participant' do
  #   end

    
  # end

  # describe 'Delete' do
  #   before(:each){
  #   }

  # end



  describe 'Slug' do
    it 'adds a slug to event' do
      Repos::Events.add_slug event_id, 'slug'
      saved_entry = @db['events'].find({id: event_id}).first
      expect(saved_entry[:slug]).to eq('slug')
    end

    it 'checks if existing slug' do
      expect(Repos::Events.available_slug? 'slug').to eq(true)
      Repos::Events.add_slug event_id, 'slug'
      expect(Repos::Events.available_slug? 'slug').to eq(false)
    end
  end


end
