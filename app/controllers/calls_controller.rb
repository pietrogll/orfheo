# frozen_string_literal: true

class CallsController < ApplicationController
  before_action :require_login!, except: []
  before_action :require_admin, only: %i[show destroy]

  # GET /users/call?id=:id
  def show
    call = Repos::Calls.get_by_id(params[:id])
    render json: { status: 'success', data: { call: call } }
  end

  # POST /users/create_call
  def create
    owner_id = check_profile_ownership!(params[:profile_id])
    call = Actions::UserCreatesCall.run(owner_id, symbolized_params)
    render json: { status: 'success', data: { call: call } }
  end

  # POST /users/delete_call
  def destroy
    Actions::UserDeletesCall.run(params[:id])
    render json: { status: 'success' }
  end

  # POST /users/modify_call
  def update
    owner_id = check_call_ownership!(params[:id])
    call = Actions::UserModifiesCall.run(owner_id, symbolized_params)
    render json: { status: 'success', data: { call: call } }
  end

  # POST /users/checks_participant_name
  def checks_participant_name
    status = Actions::CheckParticipantName.run(
      params[:name],
      params[:call_id],
      params[:program_id],
      params[:participant_id]
    )
    render json: { status: 'success', data: { available: status } }
  end

  # POST /users/add_whitelist
  def add_whitelist
    check_call_ownership!(params[:call_id])
    check_future_event!(params[:event_id])
    whitelist = Actions::UserCreatesWhitelist.run(params[:call_id], params.to_unsafe_h)
    broadcast_websocket(params[:event_id], 'addWhitelist', whitelist.to_a)
    render json: { status: 'success' }
  end

  # POST /users/delete_whitelist
  def delete_whitelist
    check_call_ownership!(params[:call_id])
    check_future_event!(params[:event_id])
    whitelist = Actions::UserDeletesWhitelist.run(params[:call_id], params[:email])
    broadcast_websocket(params[:event_id], 'addWhitelist', whitelist)
    render json: { status: 'success' }
  end

  # POST /users/get_call_proposals
  def get_call_proposals
    check_call_ownership!(params[:call_id])
    proposals = Actions::UserGetsCallProposals.run(
      params[:call_id],
      params[:type],
      params[:filters]
    )
    render json: { status: 'success', data: { proposals: proposals } }
  end

  private

  def check_call_ownership!(call_id)
    raise Pard::Invalid, 'non_existing_call' unless Repos::Calls.exists?(call_id)

    owner_id = Repos::Calls.get_owner(call_id)
    raise Pard::Invalid, 'call_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end

  def broadcast_websocket(event_id, event_type, data)
    send_web_socket_message("event:#{event_id}", event_type, data)
  end
end
