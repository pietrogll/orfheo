class ApplicationController < ActionController::Base
  # Disable CSRF for API-like behavior (configure per your needs)
  protect_from_forgery with: :null_session

  # Include concerns
  include Scopify
  include Guards
  include WebsocketHelpers

  # Symbolize params before every action
  before_action :symbolize_params

  # Helper methods

  def success(payload = {})
    render json: build_message(payload)
  end

  def build_message(payload)
    { status: 'success', data: payload }
  end

  def symbolize_params
    # Store symbolized params for use in actions
    @symbolized_params = params.to_unsafe_h.deep_symbolize_keys
  end

  # Override params to return symbolized version when called from actions
  def symbolized_params
    @symbolized_params || params.to_unsafe_h.deep_symbolize_keys
  end

  # Session helpers
  def current_user_id
    session[:identity]
  end

  def logged_in?
    session[:identity].present?
  end

  def require_login!
    raise Pard::Invalid::Authentication unless logged_in?
  end
end
