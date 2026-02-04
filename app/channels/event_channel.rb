# frozen_string_literal: true

class EventChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to event-specific updates
    # Channel format: "event:#{event_id}"
    stream_from "event:#{params[:event_id]}" if params[:event_id].present?
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
