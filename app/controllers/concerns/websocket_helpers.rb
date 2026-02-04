# WebsocketHelpers concern - Action Cable WebSocket messaging
# Migrated from Faye::WebSocket to Action Cable in Phase 7 (User Story 5)

module WebsocketHelpers
  extend ActiveSupport::Concern

  def send_web_socket_message(websocket_channel, event_to_trigger, model, signature = nil)
    message = { status: 'success', data: { event: event_to_trigger, model: model } }

    # Broadcast to Action Cable channel
    ActionCable.server.broadcast(websocket_channel, message)

    message.to_json
  end
end
