#OPEN THE BASH IN HEROKU AND EXECUTE ruby updaters/updater.rb

require_relative '../config/config.rb'
require_relative '../infrastructure/actions_index'

class EventsUpdater < BaseController

    def self.run
      puts 'running...'
      @events_collection = Repos::Events.class_variable_get(:@@collection)
      pipeline = [
        { '$match': { } } ,
        { '$project': {
          _id: 0,
          id: 1,
          eventTime: 1
        }}
      ]

      events = @events_collection.aggregate(pipeline)
      updated_events = events.map do |event|
        event[:professional] = true
        event[:eventTime] = event["eventTime"].map do |date, time|
          {
            date: date,
            time: time
          }
        end
        event
      end
      events_bulk_write_pipeline = updated_events.map{ |doc| 
        {
          "update_one": {
            "filter": {id: doc['id']},
            "update": {'$set': doc}
          }
        }
      }        
      @events_collection.bulk_write(events_bulk_write_pipeline)
      puts 'DONE: Updated Events'

    end
      
      
end

EventsUpdater.run



# class ProposalsUpdater < BaseController

#   class << self
    
#     def run
#       puts 'running...'
#       @artist_proposals_collection = Repos::Artistproposals.class_variable_get(:@@collection)
#       @space_proposals_collection = Repos::Spaceproposals.class_variable_get(:@@collection)
#       pipeline = [
#         {'$match': {user_id: {'$exists': false}}},
#         {'$project': {
#           _id: 0,
#           id: 1,
#           call_id: 1
#         }},
#         {'$lookup': {
#             from: 'calls',
#             localField: 'call_id',
#             foreignField: 'id',
#             as: 'user_id'
#           }
#         },
#         {'$addFields': {user_id: {'$arrayElemAt': ['$user_id.user_id',0]}}}
#       ]

#       updated_artistproposals = @artist_proposals_collection.aggregate(pipeline)
#       artistproposals_bulk_write_pipeline = updated_artistproposals.map{ |doc| 
#         {
#           "update_one": {
#             "filter": {id: doc['id']},
#             "update": {'$set': doc}
#           }
#         }
#       }        
#       @artist_proposals_collection.bulk_write(artistproposals_bulk_write_pipeline)
#       puts 'DONE: Updated Artistproposals'

#      updated_spaceproposals = @space_proposals_collection.aggregate(pipeline)
#       artistproposals_bulk_write_pipeline = updated_spaceproposals.map{ |doc| 
#         {
#           "update_one": {
#             "filter": {id: doc['id']},
#             "update": {'$set': doc}
#           }
#         }
#       }        
#       @space_proposals_collection.bulk_write(artistproposals_bulk_write_pipeline)
#       puts 'DONE: Updated Spaceproposals'
      
      

      # @profiles_collection.find.each{ |profile|
      #   location = profile[:address][:location].deep_dup
      #   if location.blank?
      #     profile[:address][:location] = nil
      #     profile[:address][:location] = benimaclet if profile[:address][:postal_code].to_i == 46020
      #   else
      #     new_location = [location[:lng].to_f, location[:lat].to_f]
      #     # new_location = {
      #     #   coord0_lng: location[:lng].to_f,
      #     #   coord1_lat: location[:lat].to_f
      #     # }
      #     profile[:address][:location] = new_location
      #   end
      #   @profiles_collection.replace_one({id: profile[:id]},profile)        
      # }
      # puts 'DONE: Updated Profiles lng and lat' 


    # end


    # def benimaclet
    #   [-0.3583606, 39.4884784]
    #   # {
    #   #   coord0_lng: -0.3583606,
    #   #   coord1_lat: 39.4884784
    #   # }
    # end

  #end

  
#end

