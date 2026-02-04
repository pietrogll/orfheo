# UsersController - Handles user profile and account management
# Migrated from controllers/users.rb

class UsersController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:modify_password, :save_interests, :delete_user, :modify_lang]
  before_action :require_login!, except: [:modify_lang]

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
    profiles, events, interests = Actions::UserGetsHeader.run(session[:identity])
    is_admin = admin?

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

    if session[:identity].blank?
      render json: { status: 'success' } and return
    end

    Actions::UserModifiesLanguage.run(session[:identity], lang)

    render json: { status: 'success' }
  end

  # POST /users/save_interests - Save user interests/tags
  def save_interests
    scopify :interests

    if session[:identity].blank?
      render json: { status: 'success' } and return
    end

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
  def check_invalid_password(password)
    raise Pard::Invalid::Password if password.blank? || password.length < 6
  end

  def check_lang!(lang)
    valid_langs = %w[en es fr ca pt]
    raise Pard::Invalid::Language unless valid_langs.include?(lang)
  end
end
