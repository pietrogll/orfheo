class ParticipantsController < BaseController

  post '/modify' do
    check_db_element_owneship! :participants, params[:id]
    check_future_event! params[:event_id]
    participant_for_manager = Actions::ModifiesParticipantForManager.run params
    send_web_socket_message params[:event_id], 'modifyParticipant', participant_for_manager
  end
  
end
