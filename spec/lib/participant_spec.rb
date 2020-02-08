describe Participant  do 

	require './infrastructure/actions_index'



	describe 'new participant' do

		it 'fails if it does not have mandatory fields' do
			params = {name: 'participant_name', phone: '654654654', email:''}
			expect{Participant.new(params)}.to raise_error(Pard::Invalid::Params)
		end

		
		it 'does not fails if it does have mandatory fields' do
			allow(Actions::CheckParticipantName).to receive(:run).and_return(true)
			params = {name: 'participant_name', phone: {value: '654654654',visible: 'false'}, email:'email@email.email'}
			expect{Participant.new(params)}.to_not raise_error
		end


		it 'it fails if existing participant_name' do
			allow(Actions::CheckParticipantName).to receive(:run).and_return(false)
			params = {name: 'participant_name', phone: {:value =>'654654654',visible: 'false'}, email:'email@email.email'}
			expect{Participant.new(params)}.to raise_error(Pard::Invalid::ExistingName)
		end

		it 'does not fails if it does have mandatory fields and name not existing' do
			params = {name: 'participant_name', phone: {value:'654654654',visible:'false	'}, email:'email@email.email'}
			expect{Participant.new(params)}.to_not raise_error
		end

		it 'adds owner_id as user_id if params[:user_id] = nil' do
			params = {name: 'participant_name', phone: {value:'654654654',visible:'false	'}, email:'email@email.email'}
			owner_id = 'owner_id'
			new_participant = Participant.new(params, owner_id).create.to_h
			expect(new_participant[:user_id]).to eq('owner_id')
		end


	end
end