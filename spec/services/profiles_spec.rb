# frozen_string_literal: true

describe Services::Profiles do
  let(:artist_proposal_id) { 'aaaa0000-ecac-4237-9740-c8ae7a586123' }
  let(:space_proposal_id) { 'aaaa0000-ecac-4237-9740-c8ae7a586222' }
  let(:profile_id) { 'aaaa0000-ecac-4237-9740-c8ae7a586333' }
  let(:user_id) { 'bbaa0000-ecac-4237-9740-ddae7a586333' }
  let(:otter_user_id) { 'bbaa0000-ecac-4237-9740-c8ae7a586333' }
  let(:call_id) { '00aa0000-ecac-42ee-9740-c8ae7a586333' }
  let(:otter_call_id) { '00aa0000-eaaa-4237-9740-c8ae7a586333' }

  let(:artist_proposal) do
    {
      id: artist_proposal_id,
      profile_id: profile_id,
      call_id: call_id
    }
  end

  let(:space_proposal) do
    {
      id: space_proposal_id,
      profile_id: profile_id,
      call_id: otter_call_id
    }
  end

  let(:profile) do
    {
      id: profile_id
    }
  end

  let(:call) do
    {
      id: call_id,
      user_id: user_id,
      participants: [profile_id]
    }
  end

  let(:otter_call) do
    {
      id: otter_call_id,
      user_id: otter_user_id,
      participants: [profile_id]
    }
  end

  describe 'delete_profile' do
    before(:each) do
      Repos::Artistproposals.save artist_proposal
      Repos::Spaceproposals.save space_proposal
      Repos::Calls.save call
      Repos::Calls.save otter_call
      Repos::Profiles.save profile
    end

    it 'updates to true the :own param of the corresponding proposals' do
      Services::Profiles.update_participations profile_id

      artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)
      space_proposal = Repos::Spaceproposals.get_by_id(space_proposal_id)

      expect(artist_proposal[:own]).to eq true
      expect(space_proposal[:own]).to eq true
    end

    it 'updates the user_id params with the user_id of the owner of the call' do
      Services::Profiles.update_participations profile_id

      artist_proposal = Repos::Artistproposals.get_by_id(artist_proposal_id)
      space_proposal = Repos::Spaceproposals.get_by_id(space_proposal_id)

      expect(artist_proposal[:user_id]).to eq user_id
      expect(space_proposal[:user_id]).to eq otter_user_id
    end

    it 'turns profile into particpant' do
      Services::Profiles.update_participations profile_id
      expect(MetaRepos::Participants.exists?(profile_id)).to eq true
    end
  end
end
