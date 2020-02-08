module Actions

  class CreatesParticipant
    def self.run params, owner_id
      participant = Participant.new(params, owner_id).create.to_h
      MetaRepos::Participants.save participant unless MetaRepos::Participants.exists? participant[:id]
      participant
    end

  end

  class ModifiesParticipantForManager
    def self.run params
      participant = Services::Participants.modify params
      participant_for_manager = Services::Participants.make_up_for_manager participant

    end
  end


  class RemoveParticipantFrom
  	def self.call proposal
  		profile_proposals = get_profile_proposals(proposal[:event_id],proposal[:profile_id])
	    return if profile_proposals.count > 1
	    
      Repos::Calls.remove_participant(proposal[:call_id], proposal[:profile_id])
	    MetaRepos::Participants.delete(proposal[:profile_id]) if (MetaRepos::Participants.exists?(proposal[:profile_id]) && get_profile_activities(proposal[:event_id], proposal[:profile_id]).empty?)
  	end

    def self.program activity
      Repos::Programs.remove_participant activity[:program_id], activity[:host_id] unless (get_profile_activities(activity[:event_id], activity[:host_id]).length > 0)
      unless (get_profile_activities(activity[:event_id], activity[:participant_id]).length > 0)
        Repos::Programs.remove_participant activity[:program_id], activity[:participant_id] 
        MetaRepos::Participants.delete(activity[:participant_id]) if (MetaRepos::Participants.exists?(activity[:participant_id]) && get_profile_proposals(activity[:event_id], activity[:participant_id]).empty?)
      end
    end 

    private

    def self.get_profile_proposals event_id, profile_id
      Actions::UserGetsEventProfileProposals.run event_id, profile_id
    end

    def self.get_profile_activities event_id, profile_id
      Actions::UserGetsEventProfileActivities.run event_id, profile_id
    end

  end

  class CheckParticipantName

    def self.run participant_name, call_id = nil, program_id = nil, participant_id = nil
      is_my_name?(participant_name, participant_id) || name_available?(call_id, program_id, participant_name)
    end

    def self.name_available? call_id, program_id, participant_name
      name_to_check = participant_name.gsub(/\s+/, "").downcase
      participants =  get_participants call_id, program_id
      names = participants.map{ |id|
        participant = MetaRepos::Participants.get_by_id id
        participant = Repos::Profiles.get_by_id id if participant.blank? 
        participant[:name].gsub(/\s+/, "").downcase
      }
      !(names.include? name_to_check)       
    end

    def self.get_participants call_id, program_id
      call_participants = call_id.nil? ? [] : Repos::Calls.get_participants(call_id)
      program_participants = program_id.nil? ? [] : Repos::Programs.get_participants(program_id)
      participants = call_participants + program_participants
      participants.uniq
    end

    def self.is_my_name? participant_name, participant_id = nil
      return false if (participant_id.nil? || !(MetaRepos::Participants.exists?(participant_id) || Repos::Profiles.exists?(participant_id)))
      participant = MetaRepos::Participants.get_by_id participant_id
      participant[:name].gsub(/\s+/, "").downcase == participant_name.gsub(/\s+/, "").downcase
    end
  end
  

end
