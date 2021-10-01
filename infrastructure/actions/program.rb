module Actions

  class UserCreatesProgram
    def self.run user_id, params
      program = Program.new(user_id, params).create
      Repos::Programs.save program
      Repos::Events.modify({id: program[:event_id], program_id: program[:id]})
      program
    end
  end

  
  class UserModifiesProgram
    def self.run user_id, params
      program = Program.new(user_id, params).to_h
      Repos::Programs.modify program
      program
    end
  end


  class UserDeletesProgram
    def self.run program_id
      program = Repos::Programs.get_by_id program_id
      Repos::Events.unset(program[:event_id], {program_id: ""})
      Repos::Activities.delete_many({program_id: program_id})
      Repos::Programs.delete program_id
    end
  end
  


  class UserOrdersSpaces
    def self.run program_id, order, event_id
      CachedEvent.delete event_id
      new_order = Util.arrayify_hash order
      Repos::Programs.update_order program_id, new_order
      new_order
    end
  end

  class UserPublishesProgram
    def self.run program_id, event_id
      CachedEvent.delete event_id
      Repos::Programs.publish program_id
    end
  end


  class UserSavesArtistSubcatPrices
    def self.run program_id, new_subcategories_price, event_id
      CachedEvent.delete event_id
      program = Repos::Programs.get_by_id program_id
      subcategories_price = program[:subcategories_price] || {}
      new_subcategories_price.keys.each do |subcat|
        subcategories_price[subcat] = new_subcategories_price[subcat]
      end
      Repos::Programs.modify({id: program_id, subcategories_price: subcategories_price})
      update_activities new_subcategories_price, event_id
    end

    private

    def self.update_activities subcategories_price, event_id
      subcategories_price.keys.each do |subcat|
        proposals = Repos::Artistproposals.get({'$and': [{event_id: event_id}, {subcategory: subcat}]})
        proposals.each do |proposal|
          save_price proposal[:id], subcategories_price[subcat]
        end
      end
    end

    def self.save_price proposal_id, subcategory_price
      Repos::Activities.modify_many({participant_proposal_id: proposal_id}, {price: subcategory_price})
    end

  end

  class UserSavesPermanents
    def self.run program_id, permanents, event_id
      CachedEvent.delete event_id
      permanents_dt = Util.arrayify_hash(permanents.deep_dup)
      Repos::Programs.modify({id: program_id, permanents: permanents_dt})
      [permanents_dt, update_activities(program_id, Util.arrayify_hash(permanents))]
    end

    private

    def self.update_activities program_id, permanents
      permanent_activities = Repos::Activities.get({'$and': [{program_id: program_id}, {permanent: 'true'}]})
      Actions::UserModifiesActivities.modify(permanent_activities.select{|permanent_act| 
          permanent_dt = permanents.deep_dup.inject([]){ |dt_arr, dt|
            dt_arr << dt.except('subcategories', :subcategories) if dt[:subcategories].blank? || dt[:subcategories].include?(Repos::Artistproposals.get_by_id(permanent_act[:participant_proposal_id])[:subcategory])
            dt_arr 
          }
          permanent_act[:dateTime] = permanent_dt unless permanent_dt.blank?
          !permanent_dt.blank?
        }
      )
    end

  end

end
