module ExtraReposMethods
  module Calls

    def get_forms call_id
      call = get_by_id call_id
      return if call.blank?
      call[:forms]
    end

    def add_whitelist call_id, whitelist
      collection.update_one({id: call_id},{
        "$set": {whitelist: whitelist}
      })
    end

    def get_whitelist call_id
      call = get_by_id call_id
      return nil if call.blank? 
      call[:whitelist]
    end


    def add_participant call_id, participant_id
      participants = get_participants call_id
      collection.update_one({id: call_id},{
        "$push": {participants: participant_id}
      }) unless participants.include? participant_id
    end
    
    def remove_participant call_id, participant_id
      collection.update_one({id: call_id},{
        "$pull": {participants: participant_id}
      })
    end

    def get_participants call_id
      call = get_by_id call_id
      call[:participants] || []
    end

    def add_form call_id, form_id
      forms = get_forms(call_id) || []
      collection.update_one({id: call_id},{
        "$push": {forms: form_id}
      }) unless forms.include? form_id
    end

    def remove_form call_id, form_id
      collection.update_one({id: call_id},{
        "$pull": {forms: form_id}
      })
    end

    def get_forms call_id
      call = get_by_id call_id
      call[:forms]
    end 

  end
end
