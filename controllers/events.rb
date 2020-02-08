class EventsController < BaseController

  get '/event/:slug' do # Event Page by slug
    lang = user_lang || params[:lang] || nil
    event, lang = Actions::UserGetsEventFromSlug.run session[:identity], params[:slug], lang
    status = status_for event[:user_id]
    erb :event, :locals => {:the_event => event.to_json, :status => status.to_json, :lang => lang.to_json}
  end

  get '/event' do # Event Page
    lang = user_lang || params[:lang] || nil
    event, lang = Actions::UserGetsEvent.run session[:identity], params[:id], lang
    status = status_for event[:user_id]
    erb :event, :locals => {:the_event => event.to_json, :status => status.to_json, :lang => lang.to_json}
  end

  get '/event_manager' do # event_manager page
    owner = Actions::UserGetsEventOwner.run params[:id]
    raise Pard::Unexisting unless (owner == session[:identity] || admin?)
    status = status_for owner
    erb :event_manager, :locals => {:event_id => params[:id].to_json, :status => status.to_json}
  end

  post '/users/event_manager' do # event_manager info
    scopify :event_id, :lang
    owner_id = check_event_ownership! event_id
    event, forms = Actions::UserGetsManagerData.run owner_id, event_id, lang
    success({the_event: event, forms: forms})
  end

  get '/events' do # All Events
    events = Actions::UserGetsEvents.run
    success ({events: events})
  end

  post '/users/create_event' do     
    scopify :profile_id    
    owner_id = check_profile_ownership! profile_id
    event = Actions::UserCreatesEvent.run owner_id, params, admin?
    success({event: event})
  end

  post '/users/modify_event' do
    scopify :id
    owner_id = check_event_ownership! id
    event = Actions::UserModifiesEvent.run owner_id, params, admin?
    success({event: event})
  end


  post '/users/delete_event' do
    scopify :id
    check_event_ownership! id
    Actions::UserDeletesEvent.run id, admin?
    success
  end

  post '/users/update_partners' do
    scopify :id
    check_event_ownership! id
    Actions::UserUpdatePartners.run params
    success
  end


  # get '/conFusion' do
  #   event = Services::Events.get_app_event 'a5bc4203-9379-4de0-856a-55e1e5f3fac6'
  #   success({event: event})
  # end


  post '/users/check_slug' do
    scopify :slug
    status = Actions::UserChecksSlugAvailability.run slug
    success({available: status})
  end

  post '/users/create_slug' do
    scopify :event_id, :slug
    Actions::UserSetsEventSlug.run session[:identity], event_id, slug
    success
  end


end


