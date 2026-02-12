# frozen_string_literal: true

# UsersController - Handles user profile and account management
# Migrated from controllers/users.rb

class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[header modify_password save_interests delete_user modify_lang]
  before_action :require_login!, except: %i[modify_lang save_interests]

  # GET /users - User's profile page (requires login)
  def index
    profiles = Actions::UserGetsProfiles.run(session[:identity])

    # For HTML requests, render the users view
    # For API requests, return JSON
    respond_to do |format|
      format.html do
        @profiles = profiles
        render :index, locals: { profiles: profiles.to_json }
      end
      format.json { render json: { status: 'success', profiles: profiles } }
    end
  end

  # POST /users/header - Get user header data (profiles, events, admin status)
  def header
    if session[:identity].present?
      profiles, events, interests = Actions::UserGetsHeader.run(session[:identity])
      is_admin = admin?
    else
      profiles = []
      events = []
      interests = []
      is_admin = false
    end

    render json: {
      status: 'success',
      profiles: profiles,
      events: events,
      admin: is_admin,
      interests: interests
    }
  end

  # POST /users/modify_password - Change user password
  def modify_password
    scopify :password
    check_invalid_password(password)

    Actions::UserModifiesPassword.run(session[:identity], password)

    render json: { status: 'success' }
  end

  # POST /modify_lang - Change user language preference
  def modify_lang
    scopify :lang
    check_lang!(lang)

    render json: { status: 'success' } and return if session[:identity].blank?

    Actions::UserModifiesLanguage.run(session[:identity], lang)

    render json: { status: 'success' }
  end

  # POST /users/save_interests - Save user interests/tags
  def save_interests
    scopify :interests

    render json: { status: 'success' } and return if session[:identity].blank?

    Actions::UserModifiesInterests.run(session[:identity], interests)

    render json: { status: 'success' }
  end

  # GET /users/get_user_email - Get current user's email
  def get_user_email
    user_email = Actions::UserGetsEmail.run(session[:identity])

    render json: { status: 'success', user_email: user_email }
  end

  # POST /users/delete_user - Delete current user account
  def delete_user
    Actions::UserDeletesUser.run(session[:identity])
    clean_session

    render json: { status: 'success' }
  end

  private

  def clean_session
    session.delete(:identity)
    session.delete(:last_login)
  end

  # Validation helpers
  # Redundant with Guards concern, can be removed if strictly using Guards version
  # But ensuring consistency for now
  def check_invalid_password(password)
    raise Pard::Invalid, 'incorrect_password' if password.blank? || password.length < 6
  end

  def check_lang!(lang)
    raise Pard::Invalid, 'invalid_language' unless %w[en es fr ca pt].include?(lang)
  end
end
