class ProfilesController < BaseController


  get '/profile' do
    scopify :id
    check_profile_exists! id
    owner = get_profile_owner id
    status = status_for owner
    profile = is_owner?(status) ? Actions::VisitProfileAsOwner.run(id) : Actions::VisitProfile.run(id)
    page_params = page_params_for profile 
    erb :profile, :locals => {profile: profile.to_json, status: status.to_json, page_params: page_params.to_json}
  end

  post '/users/check_name' do 
    scopify :name, :profile_id
    status = Actions::UserChecksName.run(session[:identity], name, profile_id)
    success({available: status})
  end

  post '/users/create_profile' do
    profile = Actions::UserCreatesProfile.run session[:identity], params
    success({profile: profile})
  end

  post '/users/modify_profile' do
    scopify :id
    owner_id = check_profile_ownership! id
    profile = Actions::UserModifiesProfile.run owner_id, params
    success({profile: profile})
  end

  post '/users/modify_profile_description' do
    check_profile_ownership! params[:id]
    Actions::UserModifiesProfileDescription.run params
    success({id: params[:id]})
  end

  post '/users/modify_profile_name' do
    check_profile_ownership! params[:id]
    Actions::UserModifiesProfileName.run session[:identity],params
    success({id: params[:id]})
  end

  post '/users/delete_profile' do
    scopify :id
    check_profile_ownership! id
    Actions::UserDeletesProfile.run id
    success
  end

  post '/users/list_profiles'do
    profiles = Actions::UserGetsProfiles.run session[:identity]
    success({profiles: profiles})
  end

  post '/users/profile_productions_spaces' do
    scopify :profile_id, :event_id
    productions = Actions::UserGetsProfileProductions.run profile_id
    spaces = Actions::UserGetsProfileSpaces.run profile_id
    submitted_spaces = []
    submitted_spaces = Actions::UserGetsProfileSpaces.filter profile_id, event_id if event_id
    success({productions: productions, spaces: spaces, submitted_spaces: submitted_spaces})
  end

  private

  def page_params_for profile
    image_url = profile[:profile_picture].blank? ? nil : "http://res.cloudinary.com/hxgvncv7u/image/upload/c_fill,h_630,w_1200/#{profile[:profile_picture][0]}"
    {
      title: "#{profile[:name]} | orfheo",
      description: profile[:short_description],
      image: image_url,
      og_title: "#{profile[:name]} | orfheo",
      og_description: profile[:short_description],
      og_url: "https://www.orfheo.org/profile?id=#{profile[:id]}",
      theme_color: profile[:color]
    }
  end

  def get_profile_owner profile_id
    Repos::Profiles.get_owner profile_id
  end

  def check_profile_exists! profile_id
    halt erb(:not_found) unless Repos::Profiles.exists? profile_id
  end

  def is_owner? status
    (status == :owner || status == :admin)
  end

end
