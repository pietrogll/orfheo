# frozen_string_literal: true

class Participant
  class ParticipantsController < ApplicationController
    before_action :require_login!

    # POST /participant/modify
    def modify
      check_db_element_ownership!(:participants, params[:id])
      check_future_event!(params[:event_id])

      participant_for_manager = Actions::ModifiesParticipantForManager.run(params.to_unsafe_h)

      broadcast_websocket(params[:event_id], 'modifyParticipant', participant_for_manager)
      success(participant: participant_for_manager)
    end

    private

    def check_db_element_ownership!(repo_symbol, element_id)
      repo = Object.const_get("Repos::#{repo_symbol.to_s.capitalize}")
      raise Pard::Invalid, "non_existing_#{repo_symbol}" unless repo.exists?(element_id)

      owner_id = repo.get_owner(element_id)
      raise Pard::Invalid, "#{repo_symbol}_ownership" unless owner_id == current_user_id || admin?

      owner_id
    end

    def broadcast_websocket(event_id, event_type, data)
      send_web_socket_message("event:#{event_id}", event_type, data)
    end
  end
end
