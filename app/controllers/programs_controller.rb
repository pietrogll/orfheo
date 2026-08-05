# frozen_string_literal: true

# ProgramsController - Manages programs (spaces/venues) within events
# Migrated from controllers/programs.rb

class ProgramsController < ApplicationController
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    false
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

    # Map frontend payload legacy keys
    symbolized_params[:program_id] ||= symbolized_params[:id]

    hash = Actions::UserArtistSubcategoriesPrice.run(owner_id, symbolized_params)
    send_web_socket_message("event:#{event_id}", 'artistSubcategoriesPrice', hash, signature)

    render json: { status: 'success' }
  end

  # POST /users/set_permanents - Set permanent activity times
  def set_permanents
    scopify :event_id, :signature, :program_id, :permanents
    owner_id = check_event_ownership!(event_id)

    # Map frontend payload legacy keys
    symbolized_params[:program_id] ||= symbolized_params[:id]
    the_program_id = symbolized_params[:program_id]
    # Filter to valid hash entries only: rack-test / jQuery encode [] as [""],
    # and arrays of objects as [{...}]. We want actual date/time hash objects.
    the_permanents = permanent_hashes(symbolized_params[:permanents])

    check_set_permanents!(the_program_id, the_permanents)

    unless the_permanents.blank?
      symbolized_params[:permanents] = the_permanents
      hash = Actions::UserSetPermanents.run(owner_id, symbolized_params)
      send_web_socket_message("event:#{event_id}", 'setPermanents', hash, signature)
    end

    render json: { status: 'success' }
  end

  private

  # Check if user owns the program (through event ownership)
  def check_program_ownership!(program_id)
    owner_id = Repos::Programs.get_owner(program_id)
    raise Pard::Invalid, 'program_ownership' unless owner_id == session[:identity] || admin?

    owner_id
  end

  # Validate permanent configuration during set_permanents.
  # Mirrors the original Sinatra logic: only raise if the user sent an explicitly
  # empty permanents list while permanent activities already exist in the program.
  def check_set_permanents!(program_id, permanents)
    # permanents.blank? is true when nil OR an empty array — both meaning "clear"
    if permanents.blank? && Repos::Activities.get({ '$and': [{ program_id: program_id }, { permanent: 'true' }] }).present?
      raise Pard::Invalid, 'existing_permanent_activities'
    end
  end

  # Normalise the permanents param into an array of hashes.
  #
  # jQuery serialises an array of objects as a hash with numeric string keys:
  #   permanents[0][date]=...  =>  {"0"=>{"date"=>...}, "1"=>...}
  # rack-test / form-encode serialises an empty array as  permanents[]=  which
  # Rails parses back as  [""]  (a non-empty array with one blank string).
  #
  # Util.arrayify_hash handles both: converts {"0"=>{...}} → [{...}] and
  # returns an Array as-is. We then discard any non-hash elements (e.g. "").
  def permanent_hashes(permanents)
    return [] if permanents.blank?

    Util.arrayify_hash(permanents).then do |arr|
      arr.is_a?(Array) ? arr.select { |p| p.is_a?(Hash) } : []
    end
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
