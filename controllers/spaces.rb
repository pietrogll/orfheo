class SpacesController < BaseController

  post '/users/create_space' do
    scopify :profile_id
    owner_id = check_profile_ownership! profile_id
    space = Actions::UserCreatesSpace.run owner_id, params
    success({space: space})
  end

  post '/users/modify_space' do
    scopify :id
    owner_id = check_space_ownership! id
    space = Actions::UserModifiesSpace.run owner_id, params
    success({space: space})
  end

  post '/users/delete_space' do
    scopify :id
    check_space_ownership! id
    Actions::UserDeletesSpace.run id
    success
  end

  private
  def check_space_ownership! space_id
    raise Pard::Invalid.new 'non_existing_space' unless Repos::Spaces.exists? space_id
    owner_id = Repos::Spaces.get_owner(space_id)
    raise Pard::Invalid.new 'space_ownership' unless (owner_id == session[:identity] || admin?)
    owner_id
  end
end
