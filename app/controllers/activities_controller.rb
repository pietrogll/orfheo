# frozen_string_literal: true

# ActivitiesController - Manages activities (performances/shows) within programs
# Migrated from controllers/activities.rb

class ActivitiesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy]
  before_action :require_login!

  # Rails 8.1 compatibility
  def self.action_encoding_template(_action_name)
    'utf-8'
  end

  # POST /users/create_performances - Create new activities/performances
  def create
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    # UserCreatesActivities.run expects (params, owner_id)
    activities = Actions::UserCreatesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    # If arrange_ids filtered out everything, fallback to raw activities for the response
    response_activities = activities_arranged.presence || activities
    send_web_socket_message(event_id, 'addPerformances', response_activities, signature)
 
    success(activities: response_activities)
  end

  # POST /users/modify_performances - Update activities/performances
  def update
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    # UserModifiesActivities.run now expects (params, owner_id)
    activities = Actions::UserModifiesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    response_activities = activities_arranged.presence || activities
    send_web_socket_message(event_id, 'modifyPerformances', response_activities, signature)
 
    success(activities: response_activities)
  end

  # POST /users/delete_performances - Delete activities/performances
  def destroy
    scopify :event_id, :signature
    owner_id = check_event_ownership!(event_id)
    activities = Actions::UserDeletesActivities.run(symbolized_params, owner_id)
    activities_arranged = Services::Programs.arrange_ids(activities)
    response_activities = activities_arranged.presence || activities
    send_web_socket_message(event_id, 'deletePerformances', response_activities, signature)
 
    success(activities: response_activities)
  end
end
