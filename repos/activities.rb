module ExtraReposMethods
  module Activities

      def delete_artist_activities event_id, proposal_id 
        delete_many({'$and': [{event_id: event_id}, {participant_proposal_id: proposal_id}]})
      end

      def delete_space_activities event_id, proposal_id
        delete_many({'$and': [{event_id: event_id}, {host_proposal_id: proposal_id}]})
      end

      def get_space_activities event_id, proposal_id
        get({'$and': [{event_id: event_id}, {host_proposal_id: proposal_id}]})
      end

      def modify_many query, object 
        collection.update_many(query, {
          "$set": object.to_h
        })
      end

      def reset proposal_id
        collection.update_many({participant_proposal_id: proposal_id},{
          "$unset": {title:"", short_description:"", children:""}
        })
      end

  end
end



