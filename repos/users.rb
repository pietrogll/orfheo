module ExtraReposMethods
  module Users

    def exists? query
      collection.count(query) > 0
    end

    def validated? user_id
      user = get_by_id user_id
      user[:validation].is_true?
    end

    def validate validation_code
      query = {validation_code: validation_code}
      user = get(query).first
      return nil unless user
      modify({id: user[:id], validation: true})
      delete_field query, :validation_code
      user[:id]
    end

    def reseted_user email
      collection.update_one({email: email},{
        "$set":  {validation_code: SecureRandom.uuid}
      })
      get({email: email}).first
    end

    private
    def delete_field query, field
      collection.update_one(query,{
        "$unset": {"#{field}" => ""}
      })
    end
  end
end
