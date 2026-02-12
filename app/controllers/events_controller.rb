# frozen_string_literal: true

# EventsController - Manages cultural events
# Migrated from controllers/events.rb

class EventsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy update_partners create_slug]
  before_action :require_login!, except: %i[show show_by_slug index]

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # GET /event?id=xxx - Show event by ID
  def show
    lang = user_lang || params[:lang] || nil
    event, lang = Actions::UserGetsEvent.run(session[:identity], params[:id], lang)
    status = status_for(event[:user_id])

    respond_to do |format|
      format.html do
        @the_event = event.to_json
        @status = status.to_json
        @lang = lang.to_json
        render :show
      end
      format.json { render json: { status: 'success', event: event, event_status: status, lang: lang } }
    end
  end

  # GET /event/:slug - Show event by slug
  def show_by_slug
    lang = user_lang || params[:lang] || nil

    event, lang = Actions::UserGetsEventFromSlug.run(session[:identity], params[:slug], lang)
    status = status_for(event[:user_id])

    respond_to do |format|
      format.html do
        @the_event = event.to_json
        @status = status.to_json
        @lang = lang.to_json
        render :show
      end
      format.json { render json: { status: 'success', event: event, event_status: status, lang: lang } }
    end
  end

  # GET /event_manager?id=xxx - Event manager page
  def manager
    owner = Actions::UserGetsEventOwner.run(params[:id])
    raise Pard::Unexisting unless owner == session[:identity] || admin?

    status = status_for(owner)

    respond_to do |format|
      format.html do
        @event_id = params[:id].to_json
        @status = status.to_json
        render :manager
      end
      format.json { render json: { status: 'success', event_id: params[:id], manager_status: status } }
    end
  end

  # POST /users/event_manager - Get event manager data
  def manager_data
    scopify :event_id, :lang
    owner_id = check_event_ownership!(event_id)
    event, forms = Actions::UserGetsManagerData.run(owner_id, event_id, lang)

    render json: { status: 'success', the_event: event, forms: forms }
  end

  # GET /events - List all events
  def index
    events = Actions::UserGetsEvents.run

    respond_to do |format|
      format.html do
        @events = events
        render :index
      end
      format.json { render json: { status: 'success', events: events } }
    end
  end

  # POST /users/create_event - Create new event
  def create
    scopify :profile_id
    owner_id = check_profile_ownership!(profile_id)
    event = Actions::UserCreatesEvent.run(owner_id, symbolized_params, admin?)

    render json: { status: 'success', event: event }
  end

  # POST /users/modify_event - Update event
  def update
    scopify :id
    owner_id = check_event_ownership!(id)
    event = Actions::UserModifiesEvent.run(owner_id, symbolized_params, admin?)

    render json: { status: 'success', event: event }
  end

  # POST /users/delete_event - Delete event
  def destroy
    scopify :id
    check_event_ownership!(id)
    Actions::UserDeletesEvent.run(id, admin?)

    render json: { status: 'success' }
  end

  # POST /users/update_partners - Update event partners
  def update_partners
    scopify :id
    check_event_ownership!(id)
    Actions::UserUpdatePartners.run(symbolized_params)

    render json: { status: 'success' }
  end

  # POST /users/check_slug - Check slug availability
  def check_slug
    scopify :slug
    available = Actions::UserChecksSlugAvailability.run(slug)

    render json: { status: 'success', available: available }
  end

  # POST /users/create_slug - Set event slug
  def create_slug
    scopify :event_id, :slug
    Actions::UserSetsEventSlug.run(session[:identity], event_id, slug)

    render json: { status: 'success' }
  end

  private

  def user_lang
    return nil unless logged_in?

    user = Repos::Users.get_by_id(session[:identity])
    user[:lang]
  end
end
