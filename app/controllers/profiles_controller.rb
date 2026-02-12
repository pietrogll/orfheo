# frozen_string_literal: true

# ProfilesController - Manages artist/organization profiles
# Migrated from controllers/profiles.rb

class ProfilesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy check_name]
  before_action :require_login!, except: %i[show show_by_slug index]

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # GET /profile?id=xxx - Show profile by ID
  def show
    scopify :id
    check_profile_exists!(id)
    owner = get_profile_owner(id)
    status = status_for(owner)
    profile = is_owner?(status) ? Actions::VisitProfileAsOwner.run(id) : Actions::VisitProfile.run(id)

    # Return JSON for now (HTML rendering via React app)
    render json: { status: 'success', profile: profile, profile_status: status.to_sym }
  end

  # GET /profile/:slug - Show profile by slug
  def show_by_slug
    # TODO: Implement slug lookup similar to events
    profile_id = params[:slug] # For now, treat slug as ID
    redirect_to profile_path(id: profile_id)
  end

  # GET /profiles - List all profiles
  def index
    profiles = Repos::Profiles.all
    render json: { status: 'success', profiles: profiles }
  end

  # POST /users/create_profile - Create new profile
  def create
    profile = Actions::UserCreatesProfile.run(current_user_id, symbolized_params)

    render json: { status: 'success', profile: profile }
  end

  # POST /users/modify_profile - Update profile
  def update
    scopify :id
    owner_id = check_profile_ownership!(id)
    profile = Actions::UserModifiesProfile.run(owner_id, symbolized_params)

    render json: { status: 'success', profile: profile }
  end

  # POST /users/delete_profile - Delete profile
  def destroy
    scopify :id
    check_profile_ownership!(id)
    Actions::UserDeletesProfile.run(id)

    render json: { status: 'success' }
  end

  # POST /users/check_name - Check profile name availability
  def check_name
    scopify :name, :profile_id
    available = Actions::UserChecksName.run(current_user_id, name, profile_id)

    render json: { status: 'success', available: available }
  end

  # POST /users/list_profiles - List user's profiles
  def list_profiles
    profiles = Actions::UserGetsProfiles.run(current_user_id)

    render json: { status: 'success', profiles: profiles }
  end

  # POST /users/profile_productions_spaces - Get profile productions and spaces
  def profile_productions_spaces
    scopify :profile_id, :event_id
    productions = Actions::UserGetsProfileProductions.run(profile_id)
    spaces = Actions::UserGetsProfileSpaces.run(profile_id)
    submitted_spaces = event_id ? Actions::UserGetsProfileSpaces.filter(profile_id, event_id) : []

    render json: { status: 'success', productions: productions, spaces: spaces, submitted_spaces: submitted_spaces }
  end

  private

  # Check if user owns the profile (through profile ownership or admin)
  def check_profile_ownership!(profile_id)
    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid, 'profile_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end

  # Check if profile exists
  def check_profile_exists!(profile_id)
    raise Pard::Unexisting, 'profile' unless Repos::Profiles.exists?(profile_id)
  end

  # Get profile owner user ID
  def get_profile_owner(profile_id)
    Repos::Profiles.get_owner(profile_id)
  end

  # Determine user's relationship to profile (:owner, :admin, or :visitor)
  def status_for(owner_id)
    return :admin if admin?
    return :owner if owner_id == current_user_id

    :visitor
  end

  # Check if user is owner or admin
  def is_owner?(status)
    %i[owner admin].include?(status)
  end

  # Generate meta tags for profile page
  def page_params_for(profile)
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
end
