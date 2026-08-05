# frozen_string_literal: true

module ExtraReposMethods
  module Users
    def exists?(query)
      collection.count(query).positive?
    end

    def validated?(user_id)
      user = get_by_id user_id
      user[:validation].is_true?
    end

    def validate(validation_code)
      query = { validation_code: validation_code }
      user = get(query).first
      return nil unless user

      modify({ id: user[:id], validation: true, validation_sent_at: nil })
      delete_fields(query, %i[validation_code])
      user[:id]
    end

    def reseted_user(email)
      reset_password_token = SecureRandom.uuid
      reset_password_sent_at = Time.now.to_i
      collection.update_one({ email: email }, {
                              "$set": {
                                reset_password_token: reset_password_token,
                                reset_password_sent_at: reset_password_sent_at
                              }
                            })
      get({ email: email }).first
    end

    def consume_reset_password_token(token)
      query = { reset_password_token: token }
      user = get(query).first
      return nil unless user

      delete_fields(query, %i[reset_password_token reset_password_sent_at])
      user
    end

    private

    def delete_fields(query, fields)
      collection.update_one(query, {
                              "$unset": fields.index_with { '' }
                            })
    end
  end
end
