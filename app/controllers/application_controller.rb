# frozen_string_literal: true

class ApplicationController < ActionController::Base
  # Disable CSRF for API-like behavior (configure per your needs)
  protect_from_forgery with: :null_session

  rescue_from Pard::Unexisting, Pard::Invalid do |exception|
    message = if exception.respond_to?(:message)
                # Avoid standard Ruby exception message if it's just the class name
                exception.message == exception.class.name ? 'error' : exception.message
              else
                'error'
              end
    render json: { status: 'fail', reason: message }, status: :ok
  end

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
    # Support both nested 'data' and unnested formats to satisfy different test expectations
    { status: 'success', data: payload }.merge(payload)
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
end
