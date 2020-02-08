module Actions


  class UserCreatesCall
    def self.run user_id, params
      call = Call.new(user_id, params).create
      Repos::Calls.save call
      Repos::Events.modify({id: call[:event_id], call_id: call[:id]})
      call
    end
  end

  
  class UserModifiesCall
    def self.run user_id, params
      call = Call.new(user_id, params).to_h
      Repos::Calls.modify call
      call
    end
  end

  class UserDeletesCall

    def self.run call_id
      call = Repos::Calls.get_by_id call_id
      event = Repos::Events.get_by_id call[:event_id]
      artist_proposals = Repos::Artistproposals.get({call_id: call_id})
      space_proposals = Repos::Spaceproposals.get({call_id: call_id})
      update_activities artist_proposals, space_proposals, event[:program_id] unless event[:program_id].blank?
      send_email_to_participants call[:participants], {event_name: event[:name]} unless call[:participants].blank? || !Repos::Events.is_future_event?(event[:id])
      Actions::DeleteProposalsPictures.run artist_proposals, space_proposals
      delete_proposals call_id
      delete_forms call_id
      Repos::Events.unset(call[:event_id], {call_id: ""})
      Repos::Calls.delete call_id
    end
    
    def self.delete_proposals call_id
      Repos::Artistproposals.delete_many({call_id:call_id})
      Repos::Spaceproposals.delete_many({call_id:call_id})
    end

    def self.delete_forms call_id
      Repos::Forms.delete_many({call_id: call_id})
    end

    def self.update_activities artist_proposals, space_proposals, program_id
      activities = Repos::Activities.get({program_id: program_id})  
      activities.each do |activity|
        madeUp_activity = Services::Programs.make_up_activity_with artist_proposals, space_proposals, activity
        Repos::Activities.modify(madeUp_activity)
      end
    end

    def self.send_email_to_participants particpants_ids, payload
      particpants_ids.each do |profile_id|
        profile = Repos::Profiles.get_by_id profile_id
        unless profile.blank?
          user = Repos::Users.get_by_id profile[:user_id]
          receiver = {email: profile[:email][:value], lang: user[:lang]}
          Services::Mails.new.deliver_mail_to receiver, :deleted_call, payload
        end
      end.uniq
    end

  end

  class UserCreatesWhitelist
    def self.run call_id, params
      whitelist = Whitelist.new(call_id, params)
      Repos::Calls.add_whitelist call_id, whitelist.to_a
      whitelist
    end
  end

  class UserDeletesWhitelist
    def self.run call_id, email
      call = Repos::Calls.get_by_id call_id
      call[:whitelist].reject!{ |participant| participant[:email] ==  email}
      Repos::Calls.add_whitelist call_id, call[:whitelist]
      call[:whitelist]
    end
  end

  class UserGetsCallProposals
    def self.run call_id, type, filters = {}
      filters[:call_id] = call_id
      proposalsGetter = {
        'space' => lambda{ Repos::Spaceproposals.get(filters) },
        'artist' => lambda{ Repos::Artistproposals.get(filters) }
      }
      proposalsGetter[type].call if proposalsGetter.keys.include? type
    end
  end

end
