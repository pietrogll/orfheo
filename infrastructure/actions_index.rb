require_relative './actions/profiles'
require_relative './actions/events'
require_relative './actions/proposals'
require_relative './actions/spaces'
require_relative './actions/productions'
require_relative './actions/free_blocks'
require_relative './actions/program'
require_relative './actions/users'
require_relative './actions/galleries'
require_relative './actions/tags'
require_relative './actions/admin'
require_relative './actions/calls'
require_relative './actions/participants'
require_relative './actions/forms'
require_relative './actions/activities'
require_relative './actions/db_element'
require_relative './actions/mails'
require_relative './actions/search'




module Actions

  class UserGetsHeader
    def self.run user_id
      profiles = profiles_header user_id
      events = events_header user_id
      user = Repos::Users.get_by_id(user_id)
      [profiles, events, user[:interests]]
    end

    def self.events_header user_id
      events = Repos::Events.get_user_events user_id
      events.map{ |event|
        {
          event_id: event[:id],
          name: event[:name],
          img: event[:img],
          color: event[:color]
        }
      }
    end

    def self.profiles_header user_id
    	profiles = Repos::Profiles.get_user_profiles user_id
    	profiles.map{ |profile|
	    	profile[:img] = profile[:profile_picture].first unless profile[:profile_picture].blank?
	      profile[:img] = profile[:photos].first if profile[:profile_picture].blank? && !profile[:photos].blank?
	      {
	        id: profile[:id],
	        name: profile[:name],
	        img: profile[:img],
	        color: profile[:color]
	      }
      }
    end
  end

 
  class GetByLang

    def self.run object, field, lang = nil
      field = field.to_sym
      return {} if object[field].blank?
      default_lang = object[field].keys.first
      default_lang = lang.to_sym unless lang.blank? || !object[field].has_key?(lang.to_sym)
      object[field][default_lang]
    end

  end
 
end
