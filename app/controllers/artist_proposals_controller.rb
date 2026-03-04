# frozen_string_literal: true

class ArtistProposalsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create amend update destroy select modify_param]
  before_action :require_login!

  # POST /users/send_artist_proposal
  def create
    owner_id = if params[:own].to_s == 'true'
                 check_event_ownership!(params[:event_id])
               else
                 check_profile_ownership!(params[:profile_id])
               end
    check_future_event!(params[:event_id])

    proposal = Actions::UserCreatesArtistProposal.run(owner_id, current_user_id, params.to_unsafe_h)
    Services::Assets.create(params.to_unsafe_h, proposal[:id])
    artist = Actions::UserGetsArtistsList.run(proposal).first

    broadcast_websocket(params[:event_id], 'addArtist', artist)
    success(proposal: proposal, model: proposal)
  end

  # POST /users/amend_artist_proposal
  def amend
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    Actions::UserAmendsArtistProposal.run(owner_id, current_user_id, params.to_unsafe_h)
    render json: { status: 'success' }
  end

  # POST /users/modify_artist_proposal
  def update
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    proposal = Actions::UserModifiesArtistProposal.run(owner_id, current_user_id, params.to_unsafe_h)
    artist = Actions::UserGetsArtistsList.run(proposal).first

    broadcast_websocket(params[:event_id], 'modifyArtist', artist)
    success(proposal: proposal, model: proposal)
  end

  # POST /users/delete_artist_proposal
  def destroy
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    profile_id = Actions::UserDeletesArtistProposal.run(owner_id, current_user_id, params.to_unsafe_h)

    broadcast_websocket(params[:event_id], 'deleteArtist', { profile_id: profile_id, proposal_id: params[:id] })
    render json: { status: 'success' }
  end

  # POST /users/select_artist_proposal
  def select
    owner_id = check_proposal_ownership!(params[:id], params[:call_id])
    check_future_event!(params[:event_id])

    profile_id = Actions::UserSelectsArtistProposal.run(owner_id, current_user_id, params.to_unsafe_h)

    broadcast_websocket(params[:event_id], 'selectArtist', { profile_id: profile_id, proposal_id: params[:id] })
    render json: { status: 'success' }
  end

  # POST /users/modify_param_proposal
  # Shared method for both artist and space proposals
  def modify_param
    raise Pard::Invalid::ProposalOwnership unless admin? || is_my_call?(params[:call_id])

    check_future_event!(params[:event_id])

    proposaldb = {
      'artist' => :artistproposals,
      'space' => :spaceproposals
    }

    Actions::UpdateDbElement.run(
      proposaldb[params[:type]],
      { id: params[:id], params[:param].to_sym => params[:value] }
    )

    broadcast_websocket(params[:event_id], 'modifyParamProposal', {
                          proposal_id: params[:id],
                          param: params[:param],
                          value: params[:value],
                          profile_id: params[:profile_id],
                          type: params[:type]
                        })

    render json: { status: 'success' }
  end

  private

  def check_proposal_ownership!(proposal_id, call_id)
    check_existence!(proposal_id)
    owner_id = Repos::Artistproposals.get_owner(proposal_id)
    raise Pard::Invalid::ProposalOwnership unless owner_id == current_user_id || admin? || is_my_call?(call_id)

    owner_id
  end

  def check_existence!(proposal_id)
    raise Pard::Invalid::UnexistingProposal unless Repos::Artistproposals.exists?(proposal_id)
  end

  def is_my_call?(call_id)
    current_user_id == Repos::Calls.get_owner(call_id)
  end

  def broadcast_websocket(event_id, event_type, data)
    send_web_socket_message("event:#{event_id}", event_type, data)
  end
end
