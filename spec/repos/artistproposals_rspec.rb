describe Repos::Artistproposals do

	let(:artist_proposal_id){'aaaa0000-ecac-4237-9740-c8ae7a586123'}
	let(:otter_artist_proposal_id){'daaa0000-ecac-4237-9740-c8ae7a586123'}
	let(:other_artist_proposal_id){'faaa0000-ecac-4237-9740-c8ae7a586123'}
	let(:o_artist_proposal_id){'feaa0000-ecac-4237-9740-c8ae7a586123'}
	let(:profile_id){'aaaa0000-ecac-4237-9740-c8ae7a586333'}
	let(:o_profile_id){'aaaa00bb-ecac-4237-9740-c8ae7a586333'}
	let(:user_id){'bbaa0000-ecac-4237-9740-c8ae7a586333'}
	let(:otter_user_id){'bbaa0000-aaaa-4237-9740-c8ae7a586333'}
	let(:call_id){'00aa0000-ecac-4237-9740-c8ae7a586333'}
	let(:otter_call_id){'abaa0000-ecac-4237-9740-c8ae7a586333'}

	let(:artist_proposal){{
		id: artist_proposal_id,
		profile_id: profile_id,
		call_id: call_id
	}}

	let(:otter_artist_proposal){{
		id: otter_artist_proposal_id,
		profile_id: profile_id,
		call_id: call_id
	}}

	let(:other_artist_proposal){{
		id: other_artist_proposal_id,
		profile_id: profile_id,
		call_id: otter_call_id
	}}

	let(:o_artist_proposal){{
		id: o_artist_proposal_id,
		profile_id: o_profile_id,
		call_id: otter_call_id
	}}

	let(:call){{
		id: call_id,
		user_id: user_id,
		participant: [profile_id]
	}}

	let(:otter_call){{
		id: otter_call_id,
		user_id: otter_user_id,
		participant: [profile_id]
	}}

	before(:each){
		[
			artist_proposal, 
			otter_artist_proposal, 
			other_artist_proposal,
			o_artist_proposal
		].each{ |proposal|
			Repos::Artistproposals.save proposal
		}
		Repos::Calls.save call
		Repos::Calls.save otter_call
	}

	describe 'delete_profile' do
		it 'updates to true the :own param of the corresponding proposals' do
			Repos::Artistproposals.delete_profile profile_id
			
			artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)
			otter_artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)
			other_artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)

			expect((Repos::Artistproposals.all).size).to eq 4
			expect(artist_proposal[:own]).to eq true
			expect(otter_artist_proposal[:own]).to eq true
			expect(other_artist_proposal[:own]).to eq true
		end

		it 'updates the user_id params with the user_id of the owner of the call' do 

			Repos::Artistproposals.delete_profile profile_id
			
			artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)
			otter_artist_proposal = Repos::Artistproposals.get_by_id(otter_artist_proposal_id)
			other_artist_proposal = Repos::Artistproposals.get_by_id(other_artist_proposal_id)

			expect(artist_proposal[:user_id]).to eq user_id
			expect(otter_artist_proposal[:user_id]).to eq user_id
			expect(other_artist_proposal[:user_id]).to eq otter_user_id
		end

	end 

end