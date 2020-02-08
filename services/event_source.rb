module Services

  class EsClients
    class << self

      def collection
        @@collection ||= []
      end

      def send_message channel, message
        puts "send_es_message to: #{collection.count} clients"
        collection.each{ |client|
          client[:es].send(message) if client[:channel] == channel
        }
      end
    end
  end



  class EventSource
        
    def initialize(app)
      @app = app
    end
    
    def call(env)

      if Faye::EventSource.eventsource?(env)
        setup_eventsource_connection(env)
      else
        @app.call(env)
      end
    end
    
    def setup_eventsource_connection(env)

      es = Faye::EventSource.new(env)

      client = new_client
      es_connection_open(es, client, env)
      es_connection_close(es, client)

      es.rack_response
    end

    def new_client
      { :ws => nil, :channel => nil, :id => nil}
    end
    
    def es_connection_open(es, client, env)

      request = Rack::Request.new(env)
      channel = request.params["channel"]
      id = request.params["id"]      

      es.on :open do |event|

        client[:es] = es
        client[:channel] = channel
        client[:id] = id

  
        Services::EsClients.collection.push(client)
      end
    end

    def es_connection_close(es, client)
      es.on :close do |event|
        Services::EsClients.collection.delete(client)
        es = nil
      end

    end
  end
end