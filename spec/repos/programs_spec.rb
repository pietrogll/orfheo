describe Repos::Programs do

  let(:user_id){'45825599-b8cf-499c-825c-a7134a3f1ff0'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:program_id){'00000000-b8cf-499c-825c-a7134a3f1ff0'}
  let(:event_id){'45825599-0000-499c-825c-a7134a3f1ff0'}
  let(:activity_id){'45825599-0000-499c-825c-a7134a3faaaa'}
  let(:participant_id){'bbbb5599-0000-499c-825c-a7134a3faabb'}



  let(:program){
    {
      id: program_id,  
      event_id: event_id, 
      activities: [], 
      participants: [], 
      order: [], 
      published: false, 
      price: nil, 
      ticket_url: nil
    }
  }


  before(:each){
    Repos::Programs.save program
  }

	
  describe 'Publish' do
    it 'publishes a program' do
      Repos::Programs.publish program_id
      expect(Repos::Programs.get_by_id(program_id)[:published]).to eq(true)
    end

    it 'unpublishes a program' do
      Repos::Programs.publish program_id
      Repos::Programs.publish program_id
      expect(Repos::Programs.get_by_id(program_id)[:published]).to eq(false)
    end
  end


  describe 'Activities' do

    it 'adds an activity' do
      Repos::Programs.add_activity program_id, activity_id
      expect(Repos::Programs.get_by_id(program_id)[:activities]).to include(activity_id)
    end

    it 'removes an activity' do
      Repos::Programs.add_activity program_id, activity_id
      Repos::Programs.remove_activity program_id, activity_id
      expect(Repos::Programs.get_by_id(program_id)[:activities]).not_to include(activity_id)
    end

    it 'adds the corresponding participants when an activity is added' do
      
    end

    it 'does not add participants if already added' do
    end

  end

  # describe 'Participants' do

  #   it 'updates a participant' do
  #     Repos::Programs.update_participants program_id, participant_id
  #     expect(Repos::Programs.get_by_id(program_id)[:participants].keys).to include(participant_id.to_sym)
  #   end

  #   it 'removes a participant' do
  #     Repos::Programs.update_participants program_id, participant_id
  #     Repos::Programs.remove_participant program_id, participant_id
  #     expect(Repos::Programs.get_by_id(program_id)[:participants].keys).not_to include(participant_id.to_sym)
  #   end

  # end


  describe 'Order' do

    it 'updates the order' do
      Repos::Programs.update_order(program_id, ['esp1', 'esp2'])
      expect(Repos::Programs.get_by_id(program_id)[:order]).to eq(['esp1', 'esp2'])
    end


  end



	
end