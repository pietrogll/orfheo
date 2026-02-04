# frozen_string_literal: true

class ProfileChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to profile-specific updates
    # Channel format: "profile:#{profile_id}"
    stream_from "profile:#{params[:profile_id]}" if params[:profile_id].present?
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
    stop_all_streams
  end

  def receive(data)
    # Handle incoming messages from the client if needed
    # Currently not required for one-way server->client broadcasts
  end
end
