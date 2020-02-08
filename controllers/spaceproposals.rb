class SpaceProposalsController < BaseController

  post '/users/send_space_proposal' do
    scopify :event_id, :profile_id, :own
    owner_id = own.is_true? ? check_event_ownership!(event_id) : check_profile_ownership!(profile_id)
    check_future_event! event_id
    params[:ambients] = Util.arrayify_hash(params[:ambients])
    proposal = Actions::UserCreatesSpaceProposal.run owner_id, session[:identity], params
    Services::Assets.create proposal, proposal[:id]
    proposal[:ambients].each{|ambient| Services::Assets.create ambient, proposal[:id]}
    space = Actions::UserGetsSpace.run proposal
    send_web_socket_message event_id, 'addSpace', space
  end

  post '/users/amend_space_proposal' do
    scopify :id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    Actions::UserAmendsSpaceProposal.run owner_id, session[:identity], params
    success
  end

  post '/users/modify_space_proposal' do
    scopify :id, :event_id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    params[:ambients] = Util.arrayify_hash(params[:ambients])
    proposal = Actions::UserModifiesSpaceProposal.run owner_id, session[:identity], params
    space = Actions::UserGetsSpace.run proposal
    send_web_socket_message event_id, 'modifySpace', space
  end

  post '/users/select_space_proposal' do 
    scopify :id, :event_id, :call_id
    check_program! event_id, id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    selected = Actions::UserSelectsSpaceProposal.run owner_id, session[:identity], params
    send_web_socket_message event_id, 'selectSpace', {proposal_id: id}
  end

  post '/users/delete_space_proposal' do
    scopify :id, :event_id, :call_id
    owner_id = check_proposal_ownership! id, call_id
    check_future_event! event_id
    profile_id = Actions::UserDeletesSpaceProposal.run owner_id, session[:identity], params
    send_web_socket_message event_id, 'deleteSpace', {profile_id: profile_id, proposal_id: id}
  end

  private

  def check_proposal_ownership! proposal_id, call_id
    check_existence! proposal_id
    owner_id = Repos::Spaceproposals.get_owner proposal_id
    raise Pard::Invalid::ProposalOwnership unless (owner_id == session[:identity] || admin? || is_my_call?(call_id))
    owner_id
  end

  def check_existence! proposal_id
    raise Pard::Invalid::UnexistingProposal unless Repos::Spaceproposals.exists? proposal_id
  end

  def check_program! event_id, proposal_id
    spaceprogram = Repos::Activities.get_space_activities event_id, proposal_id
    raise Pard::Invalid::ProgrammedSpace if spaceprogram.count > 0
  end

  def is_my_call? call_id
    session[:identity] == Repos::Calls.get_owner(call_id)
  end


end
