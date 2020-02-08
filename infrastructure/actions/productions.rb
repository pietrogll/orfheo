module Actions

  class  UserGetsProductionInfo
    def self.run production_id
      Services::DbElement.check_existence!(:productions, production_id)
      Services::DbElement.get_public_info(:productions, production_id)
    end
  end

  class UserCreatesProduction
    def self.run user_id, params
      production = Production.new(user_id, params).to_h
      production[:tags] = Actions::UserCreatesTags.run(production, 'productions')
      Repos::Productions.save production
      production[:gallery] = [Actions::UserCreatesGallery.run(production, 'productions')]
      production[:tags] = Actions::UserGetsTextTags.of production
      production
    end
  end

  class UserModifiesProduction
    def self.run user_id, params
      production = Production.new(user_id, params).to_h
      production[:tags] = Actions::UserCreatesTags.run(production, 'productions')
      Actions::UserUpdatesTags.run(production, Repos::Productions.get_by_id(production[:id]))
      Repos::Productions.modify production
      production[:gallery] = [Actions::UserUpdatesGallery.run(production, 'productions')]
      production[:tags] = Actions::UserGetsTextTags.of production
      production
    end
  end

  class UserDeletesProduction
    def self.run production_id
      Actions::UserUpdatesTags.update_tags(Repos::Productions.get_by_id(production_id)[:tags], production_id)
      Actions::UserDeletesGallery.run production_id
      Repos::Productions.delete production_id
    end
  end

  class UserGetsProfileProductions
    def self.run profile_id
      productions = Repos::Productions.get_profile_productions profile_id
      productions.map do |production|
        Actions::FilterProduction.run production 
      end
    end

    def self.with_tags profile_id
      productions = Repos::Productions.get_profile_productions profile_id
      productions.map do |production|
        production[:tags] = Actions::UserGetsTextTags.of production
        Actions::FilterProduction.run production 
      end
    end

  end

  class  FilterProduction
    def self.run production
      production.delete(:cache) if production.has_key?(:cache) && production[:cache].is_a?(Hash) &&  production[:cache][:visible] == false
      production
    end
  end

end
