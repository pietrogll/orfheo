module Actions


  class UserCreatesActivities
    def self.run params, owner_id 
      CachedEvent.delete params[:event_id]
      Util.arrayify_hash(params[:program]).map do |activity|
        new_participant = nil
        if activity[:participant_id].blank?
          new_participant = create_participant activity, owner_id
        	activity[:participant_id] = new_participant[:id]
        end
        new_activity = create_and_save_activity activity
        add_activity_to_program new_activity
        add_participants_to_program new_activity
        add_participant_info new_activity, new_participant if new_participant
        new_activity
      end
    end

    private

    def self.create_and_save_activity activity
      new_activity = Activity.new(activity).to_h 
      Repos::Activities.save new_activity
      new_activity
    end

    def self.create_participant activity, owner_id
      new_participant = Actions::CreatesParticipant.run activity, owner_id
    end

    def self.add_activity_to_program activity
      Repos::Programs.add_activity(activity[:program_id], activity[:id])
    end

    def self.add_participants_to_program activity
      program_id = activity[:program_id]
      participants = Repos::Programs.get_participants program_id
      Repos::Programs.add_participant(program_id, activity[:host_id]) unless participants.include? activity[:host_id]
      Repos::Programs.add_participant(program_id, activity[:participant_id]) unless participants.include? activity[:participant_id]
    end


    def self.add_participant_info activity, participant
      activity[:participant_name] = participant[:name]
      activity[:phone] = participant[:phone]
      activity[:email] = participant[:email][:value]
      activity[:own_participant] = true
    end


  end


  class UserModifiesActivities
    def self.run params
      CachedEvent.delete params[:event_id]
      modify Util.arrayify_hash(params[:program])
    end

    def self.modify activities
      activities.map do |activity|
        check_existence! activity[:id]
        new_activity = Activity.new(activity).to_h        
        Repos::Activities.modify new_activity
        new_activity
      end
    end

    private
    def self.check_existence! activity_id
      raise Pard::Invalid::UnexistingActivity unless Repos::Activities.exists? activity_id 
    end
  end

  class UserDeletesActivities
    def self.run activities, event_id
      CachedEvent.delete event_id
      activities.map do |activity|
        Repos::Activities.delete activity[:id]
        remove_activity_from_program activity
        remove_participant_from_program activity
        activity
      end
    end

    def self.remove_activity_from_program activity
      Repos::Programs.remove_activity activity[:program_id], activity[:id]
    end

    def self.remove_participant_from_program activity
      Actions::RemoveParticipantFrom.program activity
    end


  end

  class UserGetsEventProfileActivities
    def self.run event_id, profile_id
       Repos::Activities.get({'$and': [{event_id: event_id}, {"$or": [{host_id: profile_id},{participant_id: profile_id}]}]})
    end
  end


end