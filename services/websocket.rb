module Services
  
  class WsClients
    class << self

      def collection
        @@collection ||= []
      end

      def send_message channel, message, signature = nil
        collection.each{ |client|
          client[:ws].send(message) if client[:channel] == channel && client[:id] != signature
        }
        # channel_name = channel.gsub("#{base_channel}.", "")
        # # If the client has requested a subscription to this channel
        # if client[:channels].include?(channel_name)
        #   # Send the client the message, including the channel on which it
        #   # was received.
        #   message = "{\"channel\":\"#{channel_name}\",\"message\":#{msg}}"
        #   client[:ws].send(message)
        # end
      end
    end
  end



  class Websocket
    
    KEEPALIVE_TIME = 15 # in seconds
    attr_reader :clients, :base_channel
    
    def initialize(app)
      @app = app
    end
    
    def call(env)
    # puts 'call Websocket'

      if Faye::WebSocket.websocket?(env)
        setup_websocket_connection(env)
      else
        @app.call(env)
      end
    end
    
    def new_client
     # puts 'new_client'
      { :ws => nil, :channel => nil, :id => nil}
    end
    
    def setup_websocket_connection(env)
    # puts 'setup_websocket_connection'

      ws = Faye::WebSocket.new(env, nil, { ping: KEEPALIVE_TIME })

      client = new_client
      websocket_connection_open(ws, client, env)
      websocket_connection_close(ws, client)

      ws.rack_response
    end
    
    def websocket_connection_open(ws, client, env)
     # puts "websocket_connection_open // ws: #{ws}, client:#{client}"

      request = Rack::Request.new(env)
      channel = request.params["channel"]
      id = request.params["id"]      

      ws.on :open do |event|

        client[:ws] = ws
        client[:channel] = channel
        client[:id] = id

        # # For every channel the client wants to subscribe to...
        # token = session [:identity] 
        # channels.each do |channel|
        #   # Ensure they are authorized to listen on this channel. (This is not
        #   # needed, but useful if you want to add security to specific channels)
        #   if WebsocketChannelAuthorizer.can_subscribe?(channel, token)
        #     # Add the channel to the client
        #     client[:channels].push(channel)
        #   end
        # end
  
        Services::WsClients.collection.push(client)
      end
    end

    # def websocket_message(ws)
    #   ws.on :message do |event|
    #     data = JSON.parse(event.data)
    #     Services::WsClients.send_message(data['id'], data['channel'], data['msg'])
    #   end
    # end
  
    def websocket_connection_close(ws, client)
     # puts 'websocket_connection_close'
      
      ws.on :close do |event|
        Services::WsClients.collection.delete(client)
        ws = nil
      end
    end
  end


end
