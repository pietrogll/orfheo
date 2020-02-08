describe 'Services Suggest' do

  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:program_id){'a1100000-8f02-4542-a1c9-7f7aa18752ce'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}

  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:otter_event_id){'8c41cf77-32b0-4df2-9376-0960e64a3333'}
  let(:other_event_id){'8c41cf77-32b0-4df2-9376-0960e64a4444'}
  
  
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

  let(:otter_event){
    {
      profile_id: profile_id,
      id: otter_event_id,
      program_id: program_id,
      call_id: call_id,
      name: 'otter_event_name',
    }
  }


  let(:other_event){
    {
      profile_id: profile_id,
      id: other_event_id,
      # program_id: program_id,
      call_id: call_id,
      name: 'other_event_name',
    }
  }




  before(:each){
    Repos::Events.save event
    Repos::Events.save otter_event
    Repos::Events.save other_event
  }




	describe 'suggest_event_names' do
	  it 'returns empty array if nothing to suggest' do
	    suggestions =   Services::Suggest.event_names ['xi']  
	    expect(suggestions).to eq []
	  end

	  it 'suggets event names depending on initial character input' do
	    suggestions =   Services::Suggest.event_names ['ot']  
	    expect(suggestions).to eq [{text: 'otter_event_name', id: otter_event_id, profile_id: profile_id, call_id: call_id, program_id: program_id}, {text: 'other_event_name', id: other_event_id, profile_id: profile_id, call_id: call_id}]
	  end
	end


end