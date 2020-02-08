module Actions

  class  UserGetsSpaceInfo
    def self.run space_id
      Services::DbElement.check_existence!(:spaces, space_id)
      Services::Spaces.get_public_info space_id
    end
  end

  class UserCreatesSpace

    def self.run user_id, params
      params[:name] = params[:space_name] if  params[:name].blank?
      params[:ambients] = params[:ambients].values if params[:ambients].is_a?(Hash)
      # params[:ambients].reject!{ |el| el.blank? } if params[:ambients].is_a?(Array)
      space = Space.new(user_id, params).to_h
      Repos::Spaces.save space
      space[:gallery] = [Actions::UserCreatesGallery.run(space, 'spaces')]
      space[:ambients] = params[:ambients].map do |ambient_params|
        ambient = create_ambient ambient_params, space
        space[:gallery].push(Actions::UserCreatesGallery.run(ambient, 'ambients'))
        ambient.except(:space_id, :user_id, :profile_id)
      end

      space 
    end

    private


    def self.create_ambient params, space
      ambient = Ambient.new(params[:user_id], params).to_h 
      ambient[:space_id] = space[:id]
      ambient[:profile_id] = space[:profile_id]
      MetaRepos::Ambients.save ambient
      ambient
    end

  end

  

  class UserModifiesSpace
    def self.run user_id, params
      space = Space.new(user_id, params).to_h
      Repos::Spaces.modify space

      space[:gallery] = [Actions::UserUpdatesGallery.run(space, 'spaces')]

      params[:ambients] = params[:ambients].values if params[:ambients].is_a?(Hash)
      
      
      
      # Services::Gallery.delete_space_pictures params[:id], space
      # Repos::Spaces.modify space.except(:ambients, :gallery)

      update_ambients params, space
    end

    private

    def self.update_ambients params, space
      old_ambients = MetaRepos::Ambients.get({space_id: space[:id]})
      old_ambients_ids = old_ambients.map{|a| a[:id]}
      new_ambients = params[:ambients].map do |ambient_params|
        ambient = Ambient.new(space[:user_id], ambient_params).to_h 
        ambient[:space_id] = space[:id]
        ambient[:profile_id] = space[:profile_id]
        if old_ambients_ids.include?(ambient[:id]) 
          MetaRepos::Ambients.modify ambient 
          space[:gallery].push(Actions::UserUpdatesGallery.run(ambient, 'ambients'))
        else
          MetaRepos::Ambients.save ambient 
          space[:gallery].push(Actions::UserCreatesGallery.run(ambient, 'ambients'))
        end
        ambient.except(:space_id, :user_id, :profile_id)
      end
      new_ambients_ids = new_ambients.map{|a| a[:id]}
      old_ambients_ids.each do |old_ambient_id| 
        MetaRepos::Ambients.delete(old_ambient_id) unless new_ambients_ids.include?(old_ambient_id)
        Actions::UserDeletesGallery.run(old_ambient_id) unless new_ambients_ids.include?(old_ambient_id)
      end
      space[:ambients] = new_ambients
      space
    end

  end

  class UserDeletesSpace
    # def self.run space_id
    #   Services::Gallery.delete_space_pictures space_id
    #   MetaRepos::Ambients.get({space_id: space_id}).each{|ambient|
    #     MetaRepos::Ambients.delete ambient[:id]
    #     MetaRepos::Galleries.delete ambient[:id]
    #   }
    #   MetaRepos::Galleries.delete space_id
    #   Repos::Spaces.delete space_id
    # end

    def self.run space_id
      MetaRepos::Ambients.get({space_id: space_id}).each{|ambient|
        MetaRepos::Ambients.delete ambient[:id]
        Actions::UserDeletesGallery.run ambient[:id]
      }
      Actions::UserDeletesGallery.run space_id 
      Repos::Spaces.delete space_id
    end

  end


  class UserGetsProfileSpaces
    # def initialize
    #   @spaces = []
    # end
    def self.run profile_id
      spaces = Repos::Spaces.get_all_profile_spaces profile_id
      spaces.each{ |space| 
        space[:ambients] = MetaRepos::Ambients.get(space_id: space[:id]).map{ |amb| amb.except(:user_id, :space_id)}
      }
      @spaces = spaces 
    end
    def self.filter profile_id, event_id
      event_spaces = Repos::Spaceproposals.get(event_id: event_id)
      @spaces = Repos::Spaces.get_all_profile_spaces profile_id if @spaces.nil?
      @spaces.select{|space| event_spaces.any?{|e_space| e_space[:space_id] == space[:id]}}.map{|space| space[:id]}
    end
  end

end
