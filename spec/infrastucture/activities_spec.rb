describe 'Actions Activities' do


  let(:participant_profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb00'}
  let(:space_id){'00009bdd-ecac-0000-0000-c8ae7a580000'}
  let(:proposal_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:otter_proposal_id){'8c41cf77-32b0-4df2-9376-0960e64a2222'}
  let(:event_id){'a5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  let(:host_id){'8c41cf77-32b0-4df2-9376-0960e64a0000'}
  let(:program_id){'a0000000-ecac-4237-9740-c8ae7a586000'}
  let(:activity_id){'aaaa0000-ecac-4237-9740-c8ae7a586000'}
  let(:otter_activity_id){'00bc4203-0079-00e0-006a-00e1e5f3fac6'}
  
  

	let(:activity){{
    id: activity_id,
    host_id: host_id,
    host_proposal_id: proposal_id,
    event_id: event_id, 
    program_id: program_id,
    participant_id: participant_profile_id
  }}

  let(:otter_activity){{
    id: otter_activity_id,
    host_id: participant_profile_id,
    host_proposal_id: otter_proposal_id,
    event_id: event_id, 
    program_id: program_id,
    participant_id: participant_profile_id
  }}

	let(:activitities){[activity, otter_activity]}

  let(:login_route){'/login/login'}
	let(:user){
    {
      id: 'user_id',
      email: 'email@test.com',
      password: Services::Encryptor.encrypt('password'),
      validation: true
    }
  }

	before(:each){
    Repos::Users.save user
    post login_route, user
  }


	describe 'UserDeletesActivities' do

		it 'deletes all activities from the repo' do
			expect(Repos::Activities).to receive(:delete).twice
			Actions::UserDeletesActivities.run activitities, event_id
		end

	end


end