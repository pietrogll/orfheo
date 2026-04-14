# frozen_string_literal: true

# ProgramsController - Manages programs (spaces/venues) within events
# Migrated from controllers/programs.rb

class ProgramsController < ApplicationController
  skip_before_action :verify_authenticity_token,
                     only: %i[create update destroy space_order publish artist_subcategories_price set_permanents]
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # GET /program?id=xxx - Show program
  def show
    scopify :id
    check_program_ownership!(id)
    program = Actions::UserGetsProgram.run(id)

    render json: { status: 'success', program: program }
  end

  # POST /users/create_program - Create new program
  def create
    scopify :event_id
    owner_id = check_event_ownership!(event_id)
    program = Actions::UserCreatesProgram.run(owner_id, symbolized_params)

    render json: { status: 'success', program: program }
  end

  # POST /users/modify_program - Update program
  def update
    scopify :id, :permanents
    owner_id = check_program_ownership!(id)
    check_permanents!(permanents) if permanents
    check_future_event!(id, 'program')
    program = Actions::UserModifiesProgram.run(owner_id, symbolized_params)

    render json: { status: 'success', program: program }
  end

  # POST /users/delete_program - Delete program (admin only)
  def destroy
    check_admin!
    scopify :id
    Actions::UserDeletesProgram.run(id)

    render json: { status: 'success' }
  end

  # POST /users/space_order - Reorder spaces in program
  def space_order
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    
    # Map frontend payload legacy keys
    symbolized_params[:program_id] ||= symbolized_params[:id]
    symbolized_params[:space_order] ||= symbolized_params[:order]

    hash = Actions::UserSpaceOrder.run(owner_id, symbolized_params)
    send_web_socket_message("event:#{event_id}", 'orderSpaces', hash, signature)

    render json: { status: 'success' }
  end

  # POST /users/publish - Publish program
  def publish
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    hash = Actions::UserPublishProgram.run(owner_id, symbolized_params)
    send_web_socket_message("event:#{event_id}", 'publish', hash, signature)

    render json: { status: 'success' }
  end

  # POST /users/artist_subcategories_price - Set artist subcategory prices
  def artist_subcategories_price
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    hash = Actions::UserArtistSubcategoriesPrice.run(owner_id, symbolized_params)
    send_web_socket_message("event:#{event_id}", 'artistSubcategoriesPrice', hash, signature)

    render json: { status: 'success' }
  end

  # POST /users/set_permanents - Set permanent activity times
  def set_permanents
    scopify :event_id, :signature, :program_id, :permanents
    owner_id = check_event_ownership!(event_id)
    check_permanents!(permanents)
    hash = Actions::UserSetPermanents.run(owner_id, symbolized_params)
    send_web_socket_message("event:#{event_id}", 'setPermanents', hash, signature)

    render json: { status: 'success' }
  end

  private

  # Check if user owns the program (through event ownership)
  def check_program_ownership!(program_id)
    owner_id = Repos::Programs.get_owner(program_id)
    raise Pard::Invalid, 'program_ownership' unless owner_id == session[:identity] || admin?

    owner_id
  end

  # Validate permanent activities exist
  def check_permanents!(permanents)
    return unless permanents

    permanents.each do |activity_id|
      raise Pard::Invalid, 'permanent_activity_not_found' unless Repos::Activities.exists?(activity_id)
    end
  end

  # Check if event is in the future (can't modify past events)
  def check_future_event!(resource_id, resource_type)
    event_id = case resource_type
               when 'program'
                 program = Repos::Programs.get_by_id(resource_id)
                 program[:event_id]
               when 'event'
                 resource_id
               end

    event = Repos::Events.get_by_id(event_id)
    event_date = event[:date_from]
    raise Pard::Invalid, 'past_event' if event_date && Time.parse(event_date) < Time.now
  end
end
