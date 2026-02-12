# frozen_string_literal: true

# SpacesController - Manages spaces/venues linked to profiles
# Migrated from controllers/spaces.rb

class SpacesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy]
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # POST /users/create_space - Create new space
  def create
    scopify :profile_id
    owner_id = check_profile_ownership!(profile_id)
    space = Actions::UserCreatesSpace.run(owner_id, symbolized_params)

    render json: { status: 'success', space: space }
  end

  # POST /users/modify_space - Update space
  def update
    scopify :id
    owner_id = check_space_ownership!(id)
    space = Actions::UserModifiesSpace.run(owner_id, symbolized_params)

    render json: { status: 'success', space: space }
  end

  # POST /users/delete_space - Delete space
  def destroy
    scopify :id
    check_space_ownership!(id)
    Actions::UserDeletesSpace.run(id)

    render json: { status: 'success' }
  end

  private

  # Check if user owns the space (through profile ownership or admin)
  def check_space_ownership!(space_id)
    raise Pard::Unexisting, 'space' unless Repos::Spaces.exists?(space_id)

    space = Repos::Spaces.get_by_id(space_id)
    profile_id = space[:profile_id]
    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid, 'space_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end

  # Check if user owns the profile (through profile ownership or admin)
  def check_profile_ownership!(profile_id)
    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid, 'profile_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end
end
