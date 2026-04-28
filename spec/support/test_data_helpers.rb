# frozen_string_literal: true

require 'rails_helper'

# Shared test helpers for creating test data
# These helpers handle the Mongo gem API where insert_one returns a Result object
# instead of the inserted document
module TestDataHelpers
  def create_user(overrides = {})
    user_id = SecureRandom.uuid
    user_data = {
      id: user_id,
      email: "user_#{SecureRandom.hex}@test.com",
      password: BCrypt::Password.create(overrides[:password] || 'password123'),
      validation: true,
      lang: 'es',
      interests: { event_call: { categories: '' } }
    }.merge(overrides.except(:password))

    result = Repos::Users.save(user_data)
    # Mongo insert_one returns a Result object, not the document
    # Need to fetch the inserted document by its inserted_id
    Repos::Users.get({ _id: result.inserted_id }).first
  end

  def create_profile(overrides = {})
    profile_id = SecureRandom.uuid
    user_id = overrides[:user_id] || create_user[:id]
    profile_data = {
      id: profile_id,
      user_id: user_id,
      name: "Profile #{SecureRandom.hex(4)}",
      type: 'artist',
      description: 'Test profile',
      email: { value: "user_#{SecureRandom.hex}@test.com", visible: 'false' },
      phone: { value: '123', visible: 'false' },
      color: 'blue',
      address: { locality: 'Test City' }
    }.merge(overrides.except(:user_id))

    result = Repos::Profiles.save(profile_data)
    Repos::Profiles.get({ _id: result.inserted_id }).first
  end

  def create_event(overrides = {})
    event_id = SecureRandom.uuid
    user_id = overrides[:user_id] || create_user[:id]
    event_data = {
      id: event_id,
      user_id: user_id,
      name: "Event #{SecureRandom.hex(4)}",
      texts: { es: 'Event description' },
      eventTime: [{ date: '2025-01-01', time: %w[10:00 12:00] }],
      categories: ['arts'],
      place: 'Test Place',
      type: 'festival',
      public: true,
      date_start: (Time.now + 1.day).to_i * 1000,
      date_end: (Time.now + 2.days).to_i * 1000
    }.merge(overrides.except(:user_id))

    result = Repos::Events.save(event_data)
    Repos::Events.get({ _id: result.inserted_id }).first
  end

  def create_program(overrides = {})
    program_id = SecureRandom.uuid
    program_data = {
      id: program_id,
      event_id: overrides[:event_id] || create_event[:id],
      name: "Program #{SecureRandom.hex(4)}",
      activities: []
    }.merge(overrides.except(:event_id))

    result = Repos::Programs.save(program_data)
    Repos::Programs.get({ _id: result.inserted_id }).first
  end

  def create_production(overrides = {})
    production_id = SecureRandom.uuid
    production_data = {
      id: production_id,
      profile_id: overrides[:profile_id] || create_profile[:id],
      title: "Production #{SecureRandom.hex(4)}",
      type: 'performance'
    }.merge(overrides.except(:profile_id))

    result = Repos::Productions.save(production_data)
    Repos::Productions.get({ _id: result.inserted_id }).first
  end

  def create_space(overrides = {})
    space_id = SecureRandom.uuid
    space_data = {
      id: space_id,
      profile_id: overrides[:profile_id] || create_profile[:id],
      name: "Space #{SecureRandom.hex(4)}",
      address: 'Test Address'
    }.merge(overrides.except(:profile_id))

    result = Repos::Spaces.save(space_data)
    Repos::Spaces.get({ _id: result.inserted_id }).first
  end

  def create_call(overrides = {})
    call_id = SecureRandom.uuid
    user_id = overrides[:user_id] || create_user[:id]
    call_data = {
      id: call_id,
      user_id: user_id,
      profile_id: overrides[:profile_id] || create_profile(user_id: user_id)[:id],
      event_id: overrides[:event_id] || create_event(user_id: user_id)[:id],
      title: "Call #{SecureRandom.hex(4)}",
      start: (Time.now - 1.day).to_i * 1000,
      deadline: (Time.now + 30.days).to_i * 1000,
      whitelist: []
    }.merge(overrides.except(:profile_id, :event_id, :user_id))

    result = Repos::Calls.save(call_data)
    Repos::Calls.get({ _id: result.inserted_id }).first
  end

  def create_artist_proposal(overrides = {})
    proposal_id = SecureRandom.uuid
    proposal_data = {
      id: proposal_id,
      profile_id: overrides[:profile_id] || create_profile[:id],
      call_id: overrides[:call_id] || create_call[:id],
      title: "Artist Proposal #{SecureRandom.hex(4)}"
    }.merge(overrides.except(:profile_id, :call_id))

    result = Repos::Artistproposals.save(proposal_data)
    Repos::Artistproposals.get({ _id: result.inserted_id }).first
  end

  def create_space_proposal(overrides = {})
    proposal_id = SecureRandom.uuid
    proposal_data = {
      id: proposal_id,
      profile_id: overrides[:profile_id] || create_profile[:id],
      call_id: overrides[:call_id] || create_call[:id],
      title: "Space Proposal #{SecureRandom.hex(4)}"
    }.merge(overrides.except(:profile_id, :call_id))

    result = Repos::Spaceproposals.save(proposal_data)
    Repos::Spaceproposals.get({ _id: result.inserted_id }).first
  end

  def create_form(overrides = {})
    form_id = SecureRandom.uuid
    form_data = {
      id: form_id,
      call_id: overrides[:call_id] || create_call[:id],
      type: 'artist',
      blocks: { en: { title: { label: 'Title' }, description: { label: 'Description' },
                      short_description: { label: 'Short' }, category: { label: 'Category' },
                      subcategory: { label: 'Subcategory' }, format: { label: 'Format' } } },
      texts: { en: { label: "Form #{SecureRandom.hex(4)}" } }
    }.merge(overrides.except(:call_id))

    result = Repos::Forms.save(form_data)
    Repos::Forms.get({ _id: result.inserted_id }).first
  end

  def create_free_block(overrides = {})
    block_id = SecureRandom.uuid
    block_data = {
      id: block_id,
      profile_id: overrides[:profile_id] || create_profile[:id],
      user_id: overrides[:user_id] || create_user[:id],
      name: "Free block #{SecureRandom.hex(4)}",
      description: "Block content #{SecureRandom.hex(4)}"
    }.merge(overrides.except(:profile_id, :user_id))

    result = Repos::FreeBlocks.save(block_data)
    Repos::FreeBlocks.get({ _id: result.inserted_id }).first
  end

  def create_admin(overrides = {})
    # Create a user first if not provided
    user = if overrides[:user_id]
             Repos::Users.get({ id: overrides[:user_id] }).first
           else
             create_user(overrides)
           end

    admin_data = {
      id: SecureRandom.uuid,
      user_id: user[:id],
      created_at: Time.now.to_i
    }.merge(overrides.slice(:id))

    result = MetaRepos::Admins.save(admin_data)
    MetaRepos::Admins.get({ _id: result.inserted_id }).first
  end

  def login_as(user_or_admin)
    # Set the session directly for the test
    # The TestSessionMiddleware will persist this across requests
    # Handle both user records (with :id) and admin records (with :user_id)
    identity = user_or_admin[:user_id] || user_or_admin[:id]
    TestSessionMiddleware.session[:identity] = identity
    TestSessionMiddleware.session[:last_login] = Time.now.to_i
  end
end

RSpec.configure do |config|
  config.include TestDataHelpers, type: :request
end
