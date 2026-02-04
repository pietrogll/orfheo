# frozen_string_literal: true

class ProgramChannel < ApplicationCable::Channel
  def subscribed
    # Subscribe to program-specific updates
    # Channel format: "program:#{program_id}"
    stream_from "program:#{params[:program_id]}" if params[:program_id].present?
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
