module Actions

  class GetByIdDbElement
    def self.run db_key, id
      Services::DbElement.check_existence!(db_key, id)
      Services::DbElement.get_by_id(db_key, id)
    end
  end

	class UpdateDbElement 
    def self.run db_key, params
      Services::DbElement.check_existence!(db_key, params[:id])
	  	Services::DbElement.modify(db_key, params)
    end 
  end

  class CheckDbElementExistence 
    def self.run db_key, id
	  	Services::DbElement.check_existence!(db_key, id)
	  end
  end

   class GetPublicInfo
    def self.run db_key, id
      Services::DbElement.check_existence!(db_key, id)
      Services::DbElement.get_public_info db_key, id
    end
  end


end