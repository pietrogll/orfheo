# frozen_string_literal: true

# SessionsController - Handles authentication and session management
# Migrated from controllers/login.rb

class SessionsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create register destroy forgotten_password]

  # POST /register - Register a new user
  def register
    scopify :email, :password, :lang, :event_id
    check_params(email, password)
    check_lang!(lang)
    check_non_existing_user(email)

    Actions::UserRegistersUser.run(event_id, symbolized_params)

    render json: { status: 'success' }, status: :created
  end

  # GET /validate - Validate user email from validation link
  def validate
    user_id, saved_login_time = Actions::UserValidatesUser.run(params[:id])

    redirect_to root_path and return unless user_id

    register_session(user_id, saved_login_time)

    if params[:event_id] && Repos::Events.exists?(params[:event_id])
      redirect_to "http://www.orfheo.org/event?id=#{params[:event_id]}"
    else
      redirect_to users_path
    end
  end

  # POST /login - User login
  def create
    scopify :email, :password
    check_params(email, password)
    check_existing_user(email.downcase)

    user, saved_login_time = Actions::UserLogsIn.run(email.downcase, password)
    register_session(user[:id], saved_login_time)

    render json: { status: 'success', lang: user[:lang] }, status: :ok
  end

  # POST /logout or DELETE /login - User logout
  def destroy
    clean_session
    render json: { status: 'success' }, status: :ok
  end

  # GET /login - Get current session info
  def show
    if session[:identity]
      user = Repos::Users.get_by_id(session[:identity])
      render json: {
        status: 'success',
        logged_in: true,
        user_id: session[:identity],
        user: user.slice(:id, :email, :lang, :validation)
      }
    else
      render json: { status: 'success', logged_in: false }
    end
  end

  # POST /forgotten_password - Request password reset
  def forgotten_password
    scopify :email
    check_invalid_email(email)
    check_existing_user(email.downcase)

    Actions::UserResetsPassword.run(email.downcase)

    render json: { status: 'success' }, status: :ok
  end

  private

  def register_session(user_id, saved_login_time)
    session[:identity] = user_id
    session[:last_login] = saved_login_time
  end

  def clean_session
    session.delete(:identity)
    session.delete(:last_login)
  end

  def check_params(email, password)
    check_invalid_email(email)
    check_invalid_password(password)
  end

  def check_non_existing_user(email)
    raise Pard::Invalid::ExistingUser if user_exists?(email)
  end

  def check_existing_user(email)
    raise Pard::Invalid::UnexistingUser unless user_exists?(email)
  end

  def user_exists?(email)
    Repos::Users.exists?(email: email)
  end

  # Validation helpers (from BaseController)
  def check_invalid_email(email)
    raise Pard::Invalid::Email unless email&.match?(/\A[\w+\-.]+@[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]+\z/i)
  end

  def check_invalid_password(password)
    raise Pard::Invalid::Password if password.blank? || password.length < 6
  end

  def check_lang!(lang)
    valid_langs = %w[en es fr ca pt]
    raise Pard::Invalid::Language unless valid_langs.include?(lang)
  end
end
