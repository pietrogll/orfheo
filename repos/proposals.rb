module ExtraReposMethods

  module Proposals
    def count
      collection.count
    end

    def delete_profile profile_id
      documents = collection.aggregate([
        {'$match': {
          profile_id: profile_id
        }},
        {'$project': {
          _id: 0,
          id: 1,
          call_id: 1
        }},
        {'$lookup':{
          from: 'calls',
          localField: 'call_id',
          foreignField: 'id',
          as: 'user_id'
        }},
        {'$addFields': {
          own: true,
          user_id: {'$arrayElemAt': ['$user_id.user_id',0]}
        }}
      ])
      bulk_write_pipeline = documents.map{ |doc| 
        {
          "update_one": {
            "filter": {id: doc['id']},
            "update": {'$set': doc}
          }
        }
      }        
      collection.bulk_write(bulk_write_pipeline)
    end

    def select_deselect proposal_id
      proposal = get_by_id proposal_id
      modify ({id: proposal_id, selected: !proposal[:selected]})
      proposal
    end

    def unset id, fields
      collection.update_one({id: id},{
        "$unset": fields
      })
    end
  end 

  module Artistproposals
    include Proposals 
  end

  module Spaceproposals
    include Proposals 
  end

end

