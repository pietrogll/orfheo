class ArtistProposalsController < BaseController

  post '/users/send_artist_proposal' do
    scopify :event_id, :profile_id, :own
    owner_id = own.is_true? ? check_event_ownership!(event_id) : check_profile_ownership!(profile_id)
    check_future_event! event_id 
    proposal = Actions::UserCreatesArtistProposal.run owner_id, session[:identity], params
    Services::Assets.create params, proposal[:id]
    artist = Actions::UserGetsArtistsList.run(proposal).first
    send_web_socket_message event_id, 'addArtist', artist
  end

  post '/users/amend_artist_proposal' do
    scopify :id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    Actions::UserAmendsArtistProposal.run owner_id, session[:identity], params
    success
  end

   post '/users/modify_artist_proposal' do
    scopify :id, :event_id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    proposal = Actions::UserModifiesArtistProposal.run owner_id, session[:identity], params
    artist = Actions::UserGetsArtistsList.run(proposal).first
    send_web_socket_message event_id, 'modifyArtist', artist
  end

  post '/users/delete_artist_proposal' do
    scopify :id, :event_id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    profile_id = Actions::UserDeletesArtistProposal.run owner_id, session[:identity], params
    send_web_socket_message event_id, 'deleteArtist', {profile_id: profile_id, proposal_id: id}
  end

  post '/users/select_artist_proposal' do
    scopify :id, :event_id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    profile_id = Actions::UserSelectsArtistProposal.run owner_id, session[:identity], params
    send_web_socket_message event_id, 'selectArtist', {profile_id: profile_id, proposal_id: id}
  end

# METHOD FOR BOTH ARTIST AND SPACE PROPOSALS
  post '/users/modify_param_proposal' do
    # params -> id, call_id, event_id, profile_id, type, param, value
    scopify :id, :param, :value, :call_id, :event_id
    raise Pard::Invalid::ProposalOwnership unless (admin? || is_my_call?(call_id))
    check_future_event! event_id
    proposaldb = {
      'artist'=> :artistproposals,
      'space'=> :spaceproposals
    } 
    Actions::UpdateDbElement.run proposaldb[params[:type]], {:id=> id, param.to_sym => value}
    send_web_socket_message event_id, 'modifyParamProposal', {:proposal_id => id, :param => param, :value => value, profile_id: params[:profile_id], type: params[:type]}
  end


  private

  def check_proposal_ownership! proposal_id, call_id
    check_existence! proposal_id
    owner_id = Repos::Artistproposals.get_owner proposal_id
    raise Pard::Invalid::ProposalOwnership unless (owner_id == session[:identity] || admin? || is_my_call?(call_id))
    owner_id
  end

  def check_existence! proposal_id
    raise Pard::Invalid::UnexistingProposal unless Repos::Artistproposals.exists? proposal_id
  end

  def is_my_call? call_id
    session[:identity] == Repos::Calls.get_owner(call_id)
  end


end
