module ExtraReposMethods
  module Profiles

    def collation_default
      {
        collation: {
          locale: "en",
          strength: 1,
          alternate: "shifted"
        }
      }
    end
    
    def name_available? user_id, name
      name_to_check = name.gsub(/\s+/, "").downcase
      profiles = get_user_profiles(user_id)
      names = profiles.map{|profile| profile[:name].gsub(/\s+/, "").downcase}
      !(names.include? name_to_check)
    end


    def get_user_profiles user_id
      get({user_id: user_id})
    end

    def get_event_profiles event_id
      participant_ids = []
      program = Repos::Programs.get(event_id: event_id).first
      unless program.blank? || program[:published].blank?
        participant_ids = program[:participants]
      else 
        call = Repos::Calls.get(event_id: event_id).first
        participant_ids = call[:participants] unless call.blank? 
      end
      profiles = get({id: {"$in": participant_ids}})
    end

    def count query={}, options=nil
      options ||= collation_default
      collection.count(query, options)
    end


    SAMPLE_SIZE = 15

    def search unwanted = []
      unwanted ||= []
      results = collection.aggregate([
        { '$match': {id: {'$nin': unwanted}, profile_picture: {'$type': 'array'}} },
        { '$sample': { size: SAMPLE_SIZE } }       
      ])
      return [] unless results.count > 0
      Util.symbolize_array results 
    end

    def collect pipeline, options=nil
      options ||= collation_default
      results = collection.aggregate(pipeline, options)
      return [] unless results.count > 0
      Util.symbolize_array results 
    end

  end
end

