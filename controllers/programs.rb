class ProgramsController < BaseController

  get '/program' do
    scopify :id
    # check_admin!
    check_program_ownership! id
    program = Repos::Programs.get_by_id id
    success ({program: program})
  end

  post '/users/create_program' do  
    scopify :event_id    
    owner_id = check_event_ownership! event_id
    program = Actions::UserCreatesProgram.run owner_id, params
    success({program: program})
  end

  post '/users/modify_program' do
    scopify :id
    owner_id = check_program_ownership! id
    check_permanents! id, params[:permanents]
    program = Actions::UserModifiesProgram.run owner_id, params
    success({program: program})
  end

  post '/users/delete_program' do
    scopify :id
    check_admin!
    Actions::UserDeletesProgram.run id
    success
  end

  post '/users/space_order' do
    scopify :id, :event_id, :order
    check_program_ownership! id
    check_future_event! event_id
    new_order = Actions::UserOrdersSpaces.run id, order, event_id
    send_web_socket_message event_id, 'orderSpaces', new_order
  end

  post '/users/publish' do
    scopify :id, :event_id
    check_program_ownership! id
    check_future_event! event_id
    status = Actions::UserPublishesProgram.run id, event_id
    send_web_socket_message event_id, 'publishEvent', status
  end

  post '/users/artist_subcategories_price' do 
    # ATT! It change the price of all activities of the subcategories in the object subcategories_price
    scopify :id, :event_id, :subcategories_price
    check_program_ownership! id
    check_future_event! event_id 
    Actions::UserSavesArtistSubcatPrices.run id, subcategories_price, event_id unless subcategories_price.blank?
    send_web_socket_message event_id, 'assignPrices', subcategories_price
  end

  post '/users/set_permanents' do 
    # ATT! It change the permanents time of all permanent activities of the subcategories in the object permanents_time
    scopify :id, :event_id, :permanents
    check_program_ownership! id
    check_future_event! event_id
    check_permanents! id, permanents
    permanents_dt, permanent_activities = Actions::UserSavesPermanents.run id, permanents, event_id unless permanents.blank?
    permanent_activities_arranged = Services::Programs.arrange_ids permanent_activities
    send_web_socket_message event_id, 'assignPermanentsTime', {permanents:permanents_dt, activities: permanent_activities_arranged}
  end

  private

  def check_program_ownership! program_id
    raise Pard::Invalid.new 'non_existing_program' unless Repos::Programs.exists? program_id
    owner_id = Repos::Programs.get_owner program_id
    raise Pard::Invalid.new 'program_ownership' unless (owner_id == session[:identity] || admin?)
    owner_id
  end

  def check_permanents! program_id, permanents
    raise Pard::Invalid.new 'existing_permanent_activities' if (permanents.blank? && !Repos::Activities.get({'$and': [{program_id: program_id}, {permanent: 'true'}]}).blank?)
  end

end
