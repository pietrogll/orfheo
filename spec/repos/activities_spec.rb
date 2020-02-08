describe Repos::Activities do
	
	let(:user_id){'45825599-b8cf-499c-825c-a7134a3f1ff0'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:program_id){'00000000-b8cf-499c-825c-a7134a3f1ff0'}
  let(:event_id){'45825599-0000-499c-825c-a7134a3f1ff0'}
  let(:activity_id){'45825599-0000-499c-825c-a7134a3faaaa'}
  let(:otter_activity_id){'45825599-0000-499c-825c-a7134a3faaaa'}
  let(:other_activity_id){'45825599-0000-499c-825c-a7134a3faaaa'}
  let(:participant_id){'bbbb5599-0000-499c-825c-a7134a3faabb'}



  let(:activity){{
    id: activity_id,
    participant_id: 'participant_id',
    participant_proposal_id: 'participant_proposal_id',
    host_proposal_id: 'host_proposal_id',
    event_id: event_id
  }}

  let(:otter_activity){{
    id: otter_activity_id,
    participant_id: 'participant_id',
    participant_proposal_id: 'otter_proposal_id',
    host_proposal_id: 'host_proposal_id',
    event_id: event_id

  }}

  let(:other_activity){{
    id: other_activity_id,
    participant_id: 'participant_id',
    participant_proposal_id: 'participant_proposal_id',
    host_proposal_id: 'other_proposal_id',
    event_id: event_id
  }}



  before(:each){
    Repos::Activities.save activity
    Repos::Activities.save otter_activity
    Repos::Activities.save other_activity
  }

  describe 'delete_many' do

    it 'deletes all the activities that respect a condition' do
      Repos::Activities.delete_many({participant_id: 'participant_id'})
      expect(Repos::Activities.all).to eq []
    end

  end

  describe 'delete_artist_activities' do

    it 'deletes all the activities of the corresponding artist proposal' do
      Repos::Activities.delete_artist_activities(event_id, 'participant_proposal_id')
      expect(Repos::Activities.all).to eq [otter_activity]
    end

  end

  describe 'delete_space_activities' do

    it 'deletes all the activities of the corresponding artist proposal' do
      Repos::Activities.delete_space_activities(event_id, 'host_proposal_id')
      expect(Repos::Activities.all).to eq [other_activity]
    end

  end


  describe 'get with double condition' do

    it 'gets all the activities that respect the condition' do
      expect(Repos::Activities.get({'$and': [{host_proposal_id: 'host_proposal_id'}, {event_id: event_id}]})).to eq [activity, otter_activity]
    end

  end

  describe 'reset' do
    it 'resets all the activities of the modified proposal' do
      Repos::Activities.modify({id: activity_id, title: 'title', short_description: 'short_description' })
      expect(Repos::Activities.get_by_id(activity_id)).to eq(activity.merge({title:'title', short_description:'short_description'}))
      Repos::Activities.reset 'participant_proposal_id'
      expect(Repos::Activities.get_by_id(activity_id)).to eq(activity)
    end
  end

end