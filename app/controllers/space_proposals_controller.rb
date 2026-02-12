# frozen_string_literal: true

class SpaceProposalsController < ApplicationController
  before_action :require_login!

  # POST /users/send_space_proposal
  def create
    owner_id = if params[:own].to_s == 'true'
                 check_event_ownership!(params[:event_id])
               else
                 check_profile_ownership!(params[:profile_id])
               end
    check_future_event!(params[:event_id])

    # Convert ambients hash to array format
    params_hash = params.to_unsafe_h
    params_hash[:ambients] = Util.arrayify_hash(params_hash[:ambients])

    proposal = Actions::UserCreatesSpaceProposal.run(owner_id, current_user_id, params_hash)
    Services::Assets.create(proposal, proposal[:id])
    proposal[:ambients].each { |ambient| Services::Assets.create(ambient, proposal[:id]) }

    space = Actions::UserGetsSpace.run(proposal)
    broadcast_websocket(params[:event_id], 'addSpace', space)

    render json: { status: 'success', data: { proposal: proposal } }
  end

  # POST /users/amend_space_proposal
  def amend
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    Actions::UserAmendsSpaceProposal.run(owner_id, current_user_id, params.to_unsafe_h)
    render json: { status: 'success' }
  end

  # POST /users/modify_space_proposal
  def update
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    params_hash = params.to_unsafe_h
    params_hash[:ambients] = Util.arrayify_hash(params_hash[:ambients])

    proposal = Actions::UserModifiesSpaceProposal.run(owner_id, current_user_id, params_hash)
    space = Actions::UserGetsSpace.run(proposal)

    broadcast_websocket(params[:event_id], 'modifySpace', space)
    render json: { status: 'success', data: { proposal: proposal } }
  end

  # POST /users/select_space_proposal
  def select
    check_program!(params[:event_id], params[:id])
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    Actions::UserSelectsSpaceProposal.run(owner_id, current_user_id, params.to_unsafe_h)

    broadcast_websocket(params[:event_id], 'selectSpace', { proposal_id: params[:id] })
    render json: { status: 'success' }
  end

  # POST /users/delete_space_proposal
  def destroy
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    profile_id = Actions::UserDeletesSpaceProposal.run(owner_id, current_user_id, params.to_unsafe_h)

    broadcast_websocket(params[:event_id], 'deleteSpace', { profile_id: profile_id, proposal_id: params[:id] })
    render json: { status: 'success' }
  end

  private

  def check_proposal_ownership!(proposal_id, call_id)
    check_existence!(proposal_id)
    owner_id = Repos::Spaceproposals.get_owner(proposal_id)
    raise Pard::Invalid::ProposalOwnership unless owner_id == current_user_id || admin? || is_my_call?(call_id)

    owner_id
  end

  def check_existence!(proposal_id)
    raise Pard::Invalid::UnexistingProposal unless Repos::Spaceproposals.exists?(proposal_id)
  end

  def check_program!(event_id, proposal_id)
    spaceprogram = Repos::Activities.get_space_activities(event_id, proposal_id)
    raise Pard::Invalid::ProgrammedSpace if spaceprogram.count.positive?
  end

  def is_my_call?(call_id)
    current_user_id == Repos::Calls.get_owner(call_id)
  end

  def broadcast_websocket(event_id, event_type, data)
    send_web_socket_message("event:#{event_id}", event_type, data)
  end
end
