module Services
	class Users

		class << self

			def register_login user_id
				current_time = Time.now
				millisec = current_time.to_i * 1000
				Repos::Users.modify({id: user_id, last_login: millisec})
        current_time
			end

		end

	end
end