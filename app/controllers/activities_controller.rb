# frozen_string_literal: true

# ActivitiesController - Manages activities (performances/shows) within programs
# Migrated from controllers/activities.rb

class ActivitiesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy]
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    false
  end

  # POST /users/create_performances - Create new activities/performances
  def create
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    
    # Map 'program' to 'performances' as frontend sends it as form['program']
    symbolized_params[:performances] ||= symbolized_params[:program]

    # UserCreatesActivities.run expects (params, owner_id)
    activities = Actions::UserCreatesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    # If arrange_ids filtered out everything, fallback to raw activities for the response
    response_activities = activities_arranged.presence || activities
    send_web_socket_message("event:#{event_id}", 'addPerformances', response_activities, signature)
    render json: { status: 'success', event: 'addPerformances', model: response_activities }
  end

  # POST /users/modify_performances - Update activities/performances
  def update
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    
    symbolized_params[:performances] ||= symbolized_params[:program]

    # UserModifiesActivities.run now expects (params, owner_id)
    activities = Actions::UserModifiesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    response_activities = activities_arranged.presence || activities
    send_web_socket_message("event:#{event_id}", 'modifyPerformances', response_activities, signature)
    render json: { status: 'success', event: 'modifyPerformances', model: response_activities }
  end

  # POST /users/delete_performances - Delete activities/performances
  def destroy
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    
    symbolized_params[:performances] ||= symbolized_params[:program]

    activities = Actions::UserDeletesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    response_activities = activities_arranged.presence || activities
    send_web_socket_message("event:#{event_id}", 'deletePerformances', response_activities, signature)
    render json: { status: 'success', event: 'deletePerformances', model: response_activities }
  end
end
