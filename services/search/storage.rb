module ApiStorage

	class QueriesStore

    def initialize db_key
      @db_key = db_key
    end

    def get_default_query params
      send(query_builder_dictionary[@db_key.to_sym], params)
    end

    def get_query_executer
      query_executer_dictionary[@db_key.to_sym]
    end

    def new_starting_db_position n_results
      new_starting_db_position_dictionary(n_results)[@db_key.to_sym]
    end

    def query_builder_dictionary 
      {
        profiles: :build_profiles_query,
        productions: :build_productions_query,
        spaces: :build_spaces_query,
        events: :build_events_query
      }
    end

    def query_executer_dictionary
      {
        profiles: :query_profiles,
        productions: :query_productions,
        spaces: :query_spaces,
        events: :query_events
      }
    end

    def new_starting_db_position_dictionary n_results
      {
        profiles: rand(n_results),
        productions: rand(n_results),
        spaces: rand(n_results),
        events: 0
      }
    end

    private

    def build_profiles_query params
      default_query = params[:first_half_results].is_true? ? {"profile_picture.0": {'$exists': true}} : {"profile_picture.0": {'$exists': false}}
    end

    def build_productions_query params
      params[:first_half_results].is_true? ? 
        {'$and': [{"main_picture.0": {'$exists': true}}, {main_picture: {'$size': 1}}]} 
        : 
        {'$or': [{"main_picture.0": {'$exists': false}}, {'$and': [{main_picture: {'$type': 'array'}}, {main_picture: {'$size': 0}}]}]}
    end

    def build_spaces_query params
      params[:first_half_results].is_true? ? 
        {'$and': [{"main_picture.0": {'$exists': true}}, {main_picture: {'$size': 1}}]} 
        : 
        {'$or': [{"main_picture.0": {'$exists': false}}, {'$and': [{"main_picture.0": {'$exists': true}}, {main_picture: {'$size': 0}}]}]}
    end

    def build_events_query params
      now = Time.now().to_i * 1000
      default_query = params[:first_half_results].is_true? ? {'eventTime.time': {'$gte': now.to_s}} : {'eventTime.time': {"$not":{"$elemMatch":{'$gte': now.to_s}}}}
    end

    def query_events skip, limit, query
      if query[:'eventTime.time'][:'$gte'].nil?
        order = -1
        past_event = false
      else
        order = 1
        past_event = true
      end
      Repos::Events.collect([
        { '$match': query },
        { '$addFields': {starting_day: {'$min': '$eventTime.time'}, past_event: past_event} },
        { '$sort': {'starting_day': order} },
        { '$skip': skip },
        { '$limit': limit },
        { '$lookup': { 
            from: 'profiles',
            localField: 'profile_id',
            foreignField: 'id',
            as: 'profile'
          } 
        },
        { '$project': { 
          _id: 0, id: 1, call_id: 1, name: 1, type: 1, place: 1, address: 1, categories: 1, img: 1, eventTime: 1, professional: 1,
          color: { '$arrayElemAt': [ '$profile.color', 0 ] },
          past_event: 1 
        } }
      ])
    end

    def query_profiles skip, limit, query
      Repos::Profiles.collect(
        [
          { '$match': query },
          { '$skip': skip },
          { '$limit': limit },
          { '$lookup': { 
            from: 'tags',
            localField: 'tags',
            foreignField: 'id',
            as: 'tags'
            } 
          },   
          { '$project': { 
            id:1, name: 1 , facets: 1, profile_picture: 1, address: 1, color: 1,
            tags: { '$map':{ input: '$tags', in: '$$this.text' } } 
          }}
        ]
    ).shuffle
    end

    def query_productions skip, limit, query
      Repos::Productions.collect([
        { '$match': query },
        { '$skip': skip },
        { '$limit': limit },
        { '$lookup': { 
            from: 'profiles',
            localField: 'profile_id',
            foreignField: 'id',
            as: 'profile'
          } 
        },
        { '$lookup': { 
            from: 'tags',
            localField: 'tags',
            foreignField: 'id',
            as: 'tags'
          } 
        },   
        { '$project': { 
          _id: 0,  id: 1, title: 1, format: 1, category: 1, main_picture: 1, profile_id: 1, children: 1, duration: 1,
          cache: {'$cond':['$cache.visible', '$cache', nil]}, 
          profile_color: { '$arrayElemAt': [ '$profile.color', 0 ] }, profile_name: { '$arrayElemAt': [ '$profile.name', 0 ] },
          tags: { '$map':{ input: '$tags', in: '$$this.text' } } 
        }}
      ]).shuffle
    end   

    def query_spaces skip, limit, query
      Repos::Spaces.collect([
        { '$match': query },
        { '$skip': skip },
        { '$limit': limit },
        { '$lookup': { 
            from: 'profiles',
            localField: 'profile_id',
            foreignField: 'id',
            as: 'profile'
          } 
        },
        { '$project': { 
          _id: 0,  id: 1, name: 1, type: 1, address: 1, main_picture: 1, profile_id: 1, description: 1, size: 1,
          profile_color: { '$arrayElemAt': [ '$profile.color', 0 ] }, profile_name: { '$arrayElemAt': [ '$profile.name', 0 ] }
        } }
      ]).shuffle
    end   
    
  end
end