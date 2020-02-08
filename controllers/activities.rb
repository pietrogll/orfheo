class ActivitiesController < BaseController


post '/users/create_performances' do
    scopify :event_id, :signature
    onwer_id = check_event_ownership! event_id
    check_future_event! event_id
    activities = Actions::UserCreatesActivities.run params, onwer_id
    activities_arranged = Services::Programs.arrange_ids activities
    send_web_socket_message event_id, 'addPerformances', activities_arranged, signature
  end

  post '/users/modify_performances' do
    scopify :event_id, :signature
    check_event_ownership! event_id
    check_future_event! event_id
    activities = Actions::UserModifiesActivities.run params
    activities_arranged = Services::Programs.arrange_ids activities
    send_web_socket_message event_id, 'modifyPerformances', activities_arranged, signature
  end

  post '/users/delete_performances' do
    scopify :event_id, :signature
    check_event_ownership! event_id
    check_future_event! event_id
    activities = Actions::UserDeletesActivities.run(Util.arrayify_hash(params[:program]), event_id)
    activities_arranged = Services::Programs.arrange_ids activities
    send_web_socket_message event_id, 'deletePerformances', activities_arranged, signature
  end

  
  
end
