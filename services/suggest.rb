module Services
	class Suggest
		class << self

      def profile_names db_key, query
        ApiStorage.repos(db_key).collect([
          {'$match': query_for_suggestions(query)},
          {'$project': {
            _id: 0, 
            name: 1, 
            order: {'$cond':
              [{'$eq':[{'$substr':['$name', 0, query[:name].size] }, query[:name]]},
                1,
                -1
              ]
            }}
          }, 
          {'$sort': {order: -1, name: 1}}, 
          {'$project': {name: 1}}
        ])
      end

      def query_for_suggestions query
      	initial_characters = query[:name]
        {'$and': [{name: {'$gte': initial_characters}}, {name: {'$lt': pepe(initial_characters)}}]}        
      end

      def pepe characters
      	copy_characters = characters.deep_dup
      	copy_characters.gsub!(/\s+$/,'')
      	last_char  = copy_characters[-1]
      	copy_characters[-1] = following_letter_of(last_char)
      	copy_characters
      end

      def following_letter_of char
      	alphabet = 'abcdefghijklmnopqrstuvwxyz'
      	char_index = alphabet.index(char)
      	next_letter = alphabet[char_index + 1]
      end

      # def regex_with characters
      #   {'$regex': /#{characters}/i}
      # end


			def event_names query
				queriable_tags = get_query(query).first
		    tags = queriable_tags[0...-1]
		    matched_events = query_tags get_events, tags, :name
		    matched_events.map{ |event| 
		    	{
		    		text: event[:name], 
		    		id: event[:id], 
		    		profile_id: event[:profile_id], 
		    		call_id: event[:call_id], 
		    		program_id: event[:program_id] 
		    	}.delete_if { |k, v| v.nil? }
		    }
			end

			def tag_texts query, source
				queriable_tag = get_query(query).first
		    matched_tags = query_tags get_tags(source), queriable_tag, :text
		    matched_tags.map{|tag| tag.except(:source, :holders)}
			end


			private

		  def get_query params
		    return [] if params.blank?
		    check_params params
		    params.map{|param| I18n.transliterate(param).downcase}
		  end

		  def check_params params
		    return [] if params.blank?
		    raise Pard::Invalid::QueryParams unless params.is_a?(Array) && params.all?{ |param| param.is_a? String}
		    params
		  end

		  def query_tags all_tags, value, key
		    return all_tags if value.blank?
		    all_tags.select do |tag|
		      t_tag = I18n.transliterate(tag[key]).downcase
		      value == t_tag || t_tag.start_with?(value)
		    end
		  end

		  def get_events
    		events = Repos::Events.all
  		end

  		def get_tags source
		    MetaRepos::Tags.get({source: source})
		  end

  	end
	end
end