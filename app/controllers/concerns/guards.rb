# frozen_string_literal: true

# Guards concern - ownership and admin authorization checks
# Ported from controllers/base.rb helpers

module Guards
  extend ActiveSupport::Concern

  # Login requirement
  def require_login!
    raise Pard::Invalid::Unauthorized unless logged_in?
  end

  def logged_in?
    session[:identity].present?
  end

  def current_user_id
    session[:identity]
  end

  # Admin authorization
  def check_admin!
    raise Pard::Invalid::Admin unless admin?
  end

  def require_admin
    check_admin!
  end

  def admin?
    return false unless logged_in?

    MetaRepos::Admins.exists?(session[:identity])
  end

  # Event ownership
  def check_event_ownership!(event_id)
    raise Pard::Invalid::UnexistingEvent unless Repos::Events.exists?(event_id)

    owner_id = Repos::Events.get_owner(event_id)
    raise Pard::Invalid::EventOwnership unless owner_id == session[:identity] || admin?

    owner_id
  end

  def check_event_exists!(event_id)
    raise Pard::Invalid::UnexistingEvent unless Repos::Events.exists?(event_id)
  end

  # Check if event is in the future (can't modify past events)
  def check_future_event!(event_id)
    event = Repos::Events.get_by_id(event_id)
    raise Pard::Invalid::UnexistingEvent unless event

    event_date = event[:date_from]
    raise Pard::Invalid, 'past_event' if event_date && Time.parse(event_date) < Time.now
  end

  # Profile ownership
  def check_profile_ownership!(profile_id)
    raise Pard::Invalid::UnexistingProfile unless Repos::Profiles.exists?(profile_id)

    owner_id = Repos::Profiles.get_owner(profile_id)
    raise Pard::Invalid::ProfileOwnership unless owner_id == session[:identity] || admin?

    owner_id
  end

  # Call ownership
  def check_call_ownership!(call_id)
    raise Pard::Invalid::UnexistingCall unless Repos::Calls.exists?(call_id)

    owner_id = Repos::Calls.get_owner(call_id)
    raise Pard::Invalid::CallOwnership unless owner_id == session[:identity] || admin?

    owner_id
  end

  # Generic database element ownership
  def check_db_element_ownership!(db_key, id)
    check_db_element_exists!(db_key, id)
    owner_id = ApiStorage.repos(db_key).get_owner(id)
    raise Pard::Invalid::Ownership unless owner_id == session[:identity] || admin?

    owner_id
  end

  def check_db_element_exists!(db_key, id)
    Actions::CheckDbElementExistence.run(db_key, id)
  end

  # Status determination
  def status_for(owner)
    return :admin if admin?
    return :owner if owner == session[:identity]
    return :visitor if session[:identity].present? && owner != session[:identity]

    :outsider
  end

  # Validation helpers
  def check_invalid_email(email)
    raise Pard::Invalid, 'invalid_email' if email.blank? || invalid_email?(email)
  end

  def check_invalid_password(password)
    raise Pard::Invalid, 'incorrect_password' if password.blank? || password.length < 6
  end

  def check_lang!(lang)
    raise Pard::Invalid, 'invalid_language' unless %w[en es ca fr pt].include?(lang)
  end

  private

  def invalid_email?(email)
    # Basic email validation
    !email.match?(/\A[\w+\-.]+@[a-z\d-]+(\.[a-z\d-]+)*\.[a-z]+\z/i)
  end

  def invalid_password?(password)
    password.blank? || password.length < 6
  end
end
