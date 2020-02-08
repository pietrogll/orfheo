module ApiStorage
	
	class PublicInfo

    def initialize db_key
      @db_key = db_key.to_sym
    end

    def pipeline_for id
    	send(pipelines_catalog[@db_key], id)
    end

    private

    def pipelines_catalog
    	{
    		spaces: :space_public_info_pipeline,
    		productions: :production_public_info_pipeline,
    		events: :event_public_info_pipeline
    	}
    end

    def space_public_info_pipeline space_id
    	[
        { '$match': {id: space_id} },
        { '$lookup': { 
            from: 'profiles',
            localField: 'profile_id',
            foreignField: 'id',
            as: 'profile'
          } 
        },
        { '$lookup': { 
            from: 'ambients',
            localField: 'id',
            foreignField: 'space_id',
            as: 'ambients'
          } 
        },
        { '$addFields': {profile_color: { '$arrayElemAt': [ '$profile.color', 0 ] }, profile_name: { '$arrayElemAt': [ '$profile.name', 0 ] }}
        }, 
        { '$project': { 
          _id: 0, user_id: 0, profile: 0}
        }   
      ]
    end

    def production_public_info_pipeline production_id
    	[
        { '$match': {id: production_id} },
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
          _id: 0,  id: 1, title: 1, format: 1, category: 1, profile_id: 1, children: 1, duration: 1, description: 1, short_description: 1, photos: 1, links: 1,
          cache: {'$cond':['$cache.visible', '$cache', nil]},
          profile_color: { '$arrayElemAt': [ '$profile.color', 0 ] },
          profile_name: { '$arrayElemAt': [ '$profile.name', 0 ] }, 
          tags: {'$map':{input: '$tags', in: '$$this.text' }} 
          } 
        }
      ]
    end

    def event_public_info_pipeline event_id
    	[
    		{ '$match': {id: event_id} },
        { '$lookup': { 
            from: 'profiles',
            localField: 'profile_id',
            foreignField: 'id',
            as: 'profile'
          } 
        },
        { '$project': { 
          _id: 0, profile_id: 1, id: 1, name: 1, texts: 1, img: 1, professional: 1, eventTime: 1, address: 1, categories: 1, place: 1, type: 1,
          color: { '$arrayElemAt': [ '$profile.color', 0 ] },
          profile_name: { '$arrayElemAt': [ '$profile.name', 0 ] } 
          } 
        }
    	]
    end
	
	end
end