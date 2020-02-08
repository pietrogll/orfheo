module Actions


  class UserCreatesEvent
    def self.run user_id, params, is_admin = false
      event_instance = Event.new(user_id, params)
      if (is_admin and params[:professional].is_true?)
        event_instance.make_professional
      else
        event_instance.make_no_professional
      end
      event = event_instance.to_h
      Repos::Events.save event
      Actions::UserCreatesGallery.run(event, 'events')
      event
    end
  end

  class UserModifiesEvent
    def self.run user_id, params, is_admin
      event_instance = Event.new(user_id, params)
      if is_admin
        params[:professional].is_true? ? event_instance.make_professional : event_instance.make_no_professional
      end
      event = event_instance.to_h
      Repos::Events.modify event
      event[:gallery] = Actions::UserUpdatesGallery.run(event, 'events')
      event
    end
  end


  class UserDeletesEvent
    def self.run event_id, is_admin
      event = Repos::Events.get_by_id event_id
      if(event[:professional].is_true?)
        raise Pard::Invalid::Admin unless is_admin   
        Actions::UserDeletesProgram.run event[:program_id] unless event[:program_id].blank?
        Actions::UserDeletesCall.run event[:call_id] unless event[:call_id].blank? 
      end
      Actions::UserDeletesGallery.run event[:id]
      Actions::UserUpdatesEventPartnersPictures.run({ id: event[:id], partners: {}})
      Repos::Events.delete event[:id]
    end
  end

  class UserUpdatePartners
    def self.run params
      partners = params[:partners].inject({}) do |c, (k, v)|
          c[k] = Util.arrayify_hash v
          c
      end unless params[:partners].blank?
      params.delete :partners
      params[:partners] = partners || {}
      Actions::UserUpdatesEventPartnersPictures.run params
      Actions::UpdateDbElement.run :events, {id: params[:id], partners: partners}
    end
  end


  class UserUpdatesEventPartnersPictures
    def self.run params
      new_partners = params[:partners]
      old_partners = Repos::Events.get_by_id(params[:id])[:partners]
      new_partners_photos = {photos: get_partners_pictures(new_partners)}
      old_partners_photos = {photos: get_partners_pictures(old_partners)}
      Services::Gallery.compare_and_delete_unused_pictures new_partners_photos, old_partners_photos
    end

    def self.get_partners_pictures partners
      return [] if partners.blank?
      partners.keys.map do |type|
        partners[type].map do |partner|
          partner[:img]
        end  
      end.flatten.compact
    end

  end



  module CheckEvent
    def event_exists? event_id
      Repos::Events.exists? event_id
    end
    def data_for_event_page event_id, user_id, lang
      eventData = EventData.new event_id, user_id, lang
      eventData.for_event_page
    end
    def check_professional! event_id
      raise Pard::Unexisting unless Repos::Events.get_by_id(event_id)[:professional].is_true?
    end
  end

  class UserGetsEvents
    def self.run
      Services::Events.get_events
    end
  end

  class UserGetsEvent
    extend CheckEvent
    def self.run user_id, event_id, lang = nil
      raise Pard::Unexisting unless event_exists? event_id
      check_professional!(event_id)
      data_for_event_page event_id, user_id, lang
    end
  end

  class UserGetsEventFromSlug
    extend CheckEvent
    def self.run user_id, slug, lang = nil
      raise Pard::Unexisting::Slug unless Repos::Events.slug_exists? slug
      event_id = Repos::Events.get_event_id_from_slug slug
      check_professional!(event_id)
      data_for_event_page event_id, user_id, lang
    end
  end

  class UserGetsEventOwner
    extend CheckEvent
    def self.run event_id
      raise Pard::Unexisting unless event_exists? event_id
      Repos::Events.get_owner event_id
    end
  end

  class UserGetsManagerData
    def self.run user_id, event_id, lang
      eventData = EventData.new event_id, user_id, lang
      eventData.for_manager
    end
  end

  class UserChecksSlugAvailability
    def self.run slug
      slug.size >= 3 && !(slug =~ /^[a-z0-9_-]*$/).nil? && Repos::Events.available_slug?(slug)
    end
  end

  class UserSetsEventSlug
    def self.run user_id, event_id, slug
      event = Repos::Events.get_by_id event_id
      raise Pard::Invalid::UnexistingEvent unless event
      raise Pard::Invalid::EventOwnership unless (event[:user_id] == user_id || MetaRepos::Admins.exists?(user_id))
      raise Pard::Invalid.new 'invalid_slug' unless slug.size >= 3 && !(slug =~ /^[a-z0-9_-]*$/).nil?
      raise Pard::Invalid.new 'slug_in_use' unless event[:slug].blank?
      raise Pard::Invalid.new 'existing_slug' unless Repos::Events.available_slug? slug
      Repos::Events.add_slug event_id, slug
    end
  end

  

end
