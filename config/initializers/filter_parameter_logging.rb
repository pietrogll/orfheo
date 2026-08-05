# frozen_string_literal: true

# Prevent secrets and credentials from appearing in Rails request logs.
Rails.application.config.filter_parameters += [
  :password,
  :password_confirmation,
  :token,
  :reset_password_token,
  :validation_code,
  :authenticity_token,
  :cookie,
  :cookies,
  :session,
  :_orfheo_session,
  :authorization
]
