describe 'Services Participants' do
	
	

	describe 'make_up_for_manager' do

		let(:participant){{
			id: 'participant_id',
			email: {value: 'participant_email', visible: 'true'},
			phone: {value: '678678678', visible: 'true'}
		}}

		let(:made_up_participant){{
			profile_id: 'participant_id-own',
			email: 'participant_email',
			phone: {value: '678678678', visible: 'true'}
		}}

		it 'adds profile_id attribute and remove the id' do 
			expect(Services::Participants.make_up_for_manager(participant).keys.sort).to eq made_up_participant.keys.sort
		end

		it 'adds the suffix -own to profile_id' do 
			expect(Services::Participants.make_up_for_manager(participant)[:profile_id]).to include '-own'
		end

	end

end