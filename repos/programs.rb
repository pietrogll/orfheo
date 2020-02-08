module ExtraReposMethods
  module Programs
  
    def count
      collection.count
    end

    def publish program_id
      program = get_by_id program_id
      modify ({id: program_id, published: !program[:published]})
      !program[:published]
    end

    def is_publish? program_id
      get_by_id(program_id)[:published]
    end   

    def update_order program_id, order
      modify({id: program_id, order: order})
    end

    def add_space event_id, proposal_id
      collection.update_one({event_id: event_id},{
        "$push": {order: proposal_id}
      })
    end


    def remove_space event_id, proposal_id
      collection.update_one({event_id: event_id},{
        "$pull": {order: proposal_id}
      })
    end

    def add_participant program_id, profile_id
      participants = Repos::Programs.get_participants program_id
      collection.update_one({id: program_id},{
        "$push": {participants: profile_id} 
      }) unless participants.include? profile_id
    end

    def remove_participant program_id, profile_id
      collection.update_one({id: program_id},{
        "$pull": {participants: profile_id}
      })
    end

    def get_participants program_id
      program = get_by_id program_id
      program[:participants]
    end


    def add_activity program_id, activity_id
      collection.update_one({id: program_id},{
        "$push": {activities: activity_id}
      })
    end

    def remove_activity program_id, activity_id
      collection.update_one({id: program_id},{
        "$pull": {activities: activity_id}
      })
    end

    def get_activities program_id
      program = get_by_id program_id
      program[:activities]
    end
    
  end
end





