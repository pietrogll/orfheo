module Actions

	module Search

  	class LoadResults
  		
  		class << self

  			def run pull_params, db_key, query
          pull_params = parse(pull_params)
          query = prepare(query)
  				Services::Search.get_results pull_params, db_key, query
  			end

        private

        def prepare query
          return {} if query.blank?
          query.keys.inject({}) do |parsed_query, key| 
            parsed_query.merge!(query_value_for(key.to_sym, query[key]))
            parsed_query
          end
        end

        def query_value_for key, value
          catalog = {
            name: {'$text': {'$search': "\"#{value}\""}}
          }
          catalog[key]
        end

        def parse params
          Util.number_string_value_to_int(Util.string_keyed_hash_to_symbolized(params))
        end

  		end
  	
  	end

	end

end