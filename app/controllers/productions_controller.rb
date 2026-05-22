# frozen_string_literal: true

# ProductionsController - Manages productions (shows/works) linked to profiles
# Migrated from controllers/productions.rb

class ProductionsController < ApplicationController
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # POST /users/create_production - Create new production
  def create
    scopify :profile_id
    check_profile_ownership!(profile_id)
    production = Actions::UserCreatesProduction.run(current_user_id, symbolized_params)

    success(production: production)
  end

  # POST /users/modify_production - Update production
  def update
    scopify :id
    owner_id = check_production_ownership!(id)
    production = Actions::UserModifiesProduction.run(owner_id, symbolized_params)

    success(production: production)
  end

  # POST /users/delete_production - Delete production
  def destroy
    scopify :id
    check_production_ownership!(id)
    Actions::UserDeletesProduction.run(id)

    success
  end

  private

  # Check if user owns the production (through profile ownership or admin)
  def check_production_ownership!(production_id)
    raise Pard::Unexisting, 'production' unless Repos::Productions.exists?(production_id)

    production = Repos::Productions.get_by_id(production_id)
    profile_id = production[:profile_id]
    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid, 'production_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end

  # Check if user owns the profile (through profile ownership or admin)
  def check_profile_ownership!(profile_id)
    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid, 'profile_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end
end
