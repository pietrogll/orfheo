class ProductionsController < BaseController

  post '/users/create_production' do

    scopify :profile_id
    check_profile_ownership! profile_id
    production = Actions::UserCreatesProduction.run session[:identity], params

    success({production: production})
  end

  post '/users/modify_production' do
    scopify :id
    owner_id = check_production_ownership! id

    production = Actions::UserModifiesProduction.run owner_id, params

    success({production: production})
  end

  post '/users/delete_production' do
    scopify :id
    check_production_ownership! id
    Actions::UserDeletesProduction.run id
    success
  end

  private
  def check_production_ownership! id
    raise Pard::Invalid::UnexistingProduction unless Repos::Productions.exists? id
    owner_id = Repos::Productions.get_owner(id)
    raise Pard::Invalid::ProductionOwnership unless (owner_id == session[:identity] || admin?)
    owner_id
  end
end
