module ExtraReposMethods
  module Events

    def collation_default
      {
        collation: {
          locale: "en",
          strength: 1,
          alternate: "shifted"
        }
      }
    end

    def unset event_id, fields #fields = {key_to_remove: ""}
      collection.update_one({id: event_id},{
        "$unset": fields
      })
    end

    def slug_exists? slug
      collection.count(slug: slug) > 0
    end

    def add_slug event_id, slug
      collection.update_one({id: event_id},{
        "$set": {slug: slug}
      })
    end

    def available_slug? slug
      events = all
      slugs = events.map{|event| event[:slug].downcase if event[:slug]}.compact
      !(slugs.include? slug)
    end

    def get_event_by_slug slug
      grab({slug: slug}).first
    end

    def get_event_id_from_slug slug
      event = grab({slug: slug}).first
      event[:id]
    end

    def get_user_events user_id
      get({user_id: user_id, professional: true})
    end

    def is_future_event? event_id
      event = get_by_id event_id
      ending_time = event[:eventTime].map{|evt| evt[:time].map(&:to_i)}.flatten.max
      ending_time/1000 > Time.now.to_i
    end

    def collect pipeline, options=nil
      options ||= collation_default
      results = collection.aggregate(pipeline, options)
      return [] unless results.count > 0
      Util.symbolize_array results 
    end

    def count query={}, options=nil
      options ||= collation_default
      collection.count(query, options)
    end
    
  end
end


