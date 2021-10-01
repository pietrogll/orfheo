module Services
  class Participants
    class << self
    	
    	def make_up_for_manager participant
    		participant[:profile_id] = participant[:id]+'-own'
    		participant.delete(:id)
        participant[:email] = participant[:email][:value]
    		participant
    	end

      def modify params
        participant = Participant.new(params).modify.to_h
        MetaRepos::Participants.modify(participant)
        participant
        end

    end
  end
end