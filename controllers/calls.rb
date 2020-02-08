class CallsController < BaseController

  get '/call' do
    scopify :id
    check_admin! 
    call = Repos::Calls.get_by_id id
    success ({call: call})
  end

  post '/users/create_call' do     
    scopify :profile_id    
    owner_id = check_profile_ownership! profile_id
    call = Actions::UserCreatesCall.run owner_id, params
    success({call: call})
  end

  post '/users/delete_call' do
    scopify :id
    check_admin!
    Actions::UserDeletesCall.run id
    success
  end

  post '/users/modify_call' do
    scopify :id
    owner_id = check_call_ownership! id
    call = Actions::UserModifiesCall.run owner_id, params
    success({call: call})
  end

  post '/users/checks_participant_name' do
    scopify :call_id, :program_id, :name, :participant_id
    status = Actions::CheckParticipantName.run name, call_id, program_id, participant_id
    success({available: status})
  end


  post '/users/add_whitelist' do
    scopify :event_id, :call_id
    check_call_ownership! call_id
    check_future_event! event_id 
    whitelist = Actions::UserCreatesWhitelist.run call_id, params
    send_web_socket_message event_id, 'addWhitelist', whitelist.to_a
  end

  post '/users/delete_whitelist' do
    scopify :event_id, :call_id, :email
    check_call_ownership! call_id
    check_future_event! event_id 
    whitelist = Actions::UserDeletesWhitelist.run call_id, email
    send_web_socket_message event_id, 'addWhitelist', whitelist
  end

  post '/users/get_call_proposals' do
    scopify :call_id, :filters, :type
    check_call_ownership! call_id
    proposals = Actions::UserGetsCallProposals.run call_id, type, filters
    success ({proposals: proposals})
  end

  # private

  # def check_call_ownership! call_id
  #   raise Pard::Invalid.new 'non_existing_call' unless Repos::Calls.exists? call_id
  #   owner_id = Repos::Calls.get_owner(call_id)
  #   raise Pard::Invalid.new 'call_ownership' unless (owner_id == session[:identity] || admin?)
  #   owner_id 
  # end

end
