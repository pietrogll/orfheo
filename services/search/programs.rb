module Services
	class Search
		class << self

			@lang = Dictionary.default_language

			def get_program_suggestions lang, event_id, queriable_tags, filters
				#  It suggets for participant_name, host_name, title, locality (city) --> add_suggestions
				# filters: {hosts: ---, participants: ----, other: ----}
				check_lang! lang
				tags = queriable_tags[0...-1]
				program = Services::Events.get_event_program event_id
				matched_performances = query_program program, tags, filters
				results = get_suggestions_for matched_performances, queriable_tags
				sort_results results
			end

			def get_program_results lang, event_id, tags, filters, date, time
				#  It search for participant_name, host_name, title, locality (city), short_description --> searcheable_fields
				check_lang! lang
				program = Services::Events.get_event_program event_id
				program = program.select{|performance|
					performance[:date] == date} unless date.blank?
				results = query_program program, tags, filters
				results = select_now results, time unless time.blank?
				order_results results
			end

			private
			def check_lang! lang
		    raise Pard::Invalid.new 'invalid_language' unless ['en', 'es', 'ca'].include? lang
		    @lang = lang.to_sym
		  end

			def select_now results, time
				results.select{|performance|
					(performance[:time].first.to_i > time.to_i && performance[:time].first.to_i < time.to_i + 3600 * 1000) || (performance[:time].first.to_i < time.to_i && performance[:time].last.to_i > time.to_i + 60 * 15 * 1000)
				}
			end

			def query_program program, tags, filters		
				program = filter_participants program, filters[:participants] if filters.has_key? :participants
				program = filter_hosts program, filters[:hosts] if filters.has_key? :hosts
				program = filter_other program, filters[:other] if filters.has_key? :other
				return program if tags.all?{ |tag| tag.blank? }
				program.select{ |performance|
					query_performance(performance, tags)
				}
			end

			def filter_participants program, filters
				program.select{ |performance|
					filters.include? performance[:participant_subcategory].to_s
				}
			end

			def filter_hosts program, filters
				program.select{ |performance|
					filters.include? performance[:host_subcategory].to_s
				}
			end

			def filter_other program, filters
				program.select{ |performance|
					filters.include? performance[:children]
				}
			end

			def query_performance performance, tags
				tags.all?{ |tag|
					check_performance(performance, tag) 
				}
			end

			def check_performance performance, tag
				return check_value performance[:participant_category], tag if artist_category?(tag)
				return check_value performance[:host_category], tag if space_category?(tag)
				searcheable_fields.any?{ |field|
					check_value performance[field], tag
				}
			end

			def check_value value, tag
				return check_hash(value, tag) if value.is_a? Hash
				matches?(value, tag) if value.is_a? String
			end

			def check_hash value, tag
				value.keys.any?{ |key|
					matches?(value[key], tag) if value[key].is_a? String
				}
			end

			def matches? value, tag
				matchable_tags = tag.split(/\W+/)
				matchable_value = translate(I18n.transliterate(value).downcase)
				words = matchable_value.split(/\W+/).map{ |word| translate(word).split(/\W+/)}.flatten
				matchable_value == tag || words_match?(words, matchable_tags)
			end

			def words_match? words, tags
				tags.all?{ |tag|
					words.any?{ |word|
						word.start_with? tag  
					}
				}
			end

			def searcheable_fields
				[
					:participant_name,
					:host_name,
					:address,
					:title,
					:short_description
				]
			end

			def artist_category? text
		    dictionary = {
		      es:[
		        'artes escenicas',
		        'audiovisual',
		        'artesania',
		        'gastronomia',
		        'salud y bienestar',
		        'literatura',
		        'musica',
		        'otros',
		        'arte urbano',
		        'artes visuales'
		      ],
		      en: [
		        'performing arts',
		        'audiovisual',
		        'craftwork',
		        'gastronomy',
		        'health & wellness',
		        'literature',
		        'music',
		        'other',
		        'street art',
		        'visual arts'
		      ],
		      ca: [
		        'arts esceniques',
		        'audiovisual',
		        'artesania',
		        'gastronomia',
						'salut i benestar',
						'literatura',
		      	'musica',
		        'altres',
		        'art de carrer',
		        'arts visuals'
		      ]
		    }
		    dictionary[@lang].include? text
		  end

		  def space_category? text
		    dictionary = {
		      es:[
		        'espacio exterior',
		        'espacio cultural',
		        'local comercial', 
		        'espacio particular',
		        'festival',
		        'asociacion', 
		        'ong', 
		        'colectivo', 
		        'empresa', 
		        'institucion',
		        'federacion',
		        'fundacion'
		      ],
		      en: [
		        'open air',
		        'cultural space',
		        'business', 
		        'private home',
		        'festival',
		        'association', 
		        'ngo', 
		        'collective', 
		        'enterprise', 
		        'institution',
		        'federation',
		        'foundation'
		      ],
		      ca:[
		      	'espai exterior',
		        'espai cultural',
		        'local comercial', 
		        'espai particular',
		        'festival',
		        'associacio', 
		        'ong', 
		        'col·lectiu', 
		        'enterprise', 
		        'institucio',
		        'federacio',
		        'fundacio'
		      ]
		    }
		    dictionary[@lang].include? text
		  end
			
			def get_suggestions_for matched_performances, query
				# suggestions = []
				return [] if query.last.blank?
				matched_performances.inject([]) do |suggestions, performance|
					add_suggestions suggestions, performance, query 
					suggestions 
				end
				# suggestions
			end

			def queriable? value, query
				return false if value.nil?
				tags = query[0...-1]
				return false if tags.any? { |tag| tag == translate(I18n.transliterate(value).downcase)}
				matches? value, query.last
			end

			def add_suggestions suggestions, performance, query
				add_suggestion(suggestions, performance[:participant_name], 'name', 'artist') if queriable? performance[:participant_name], query
				add_suggestion(suggestions, performance[:host_name], 'name', 'space') if queriable? performance[:host_name], query
				add_suggestion(suggestions, performance[:title], 'title') if queriable? performance[:title], query
				add_suggestion(suggestions, Util.string_keyed_hash_to_symbolized(performance[:address])[:locality], 'city') if queriable? performance[:address][:locality], query
			end

			def add_suggestion suggestions, text, type, icon = nil
				icon = icon || text
				translation = I18n.transliterate(translate text)
				suggestions.push({id: translation, text: translation, type: type, icon: icon}) unless suggestions.any?{ |suggestion| suggestion[:text].downcase == I18n.transliterate(translation).downcase}
			end

			def translate text
		    dictionary = {
		      es: {
		        artist: 'artista',
		        space: 'espacio',
		        organization: 'organizacion',
		        open_air: 'espacio exterior',
		        cultural_ass: 'espacio cultural',
		        commercial: 'local comercial',
		        home: 'espacio particular',
		        arts: 'artes escenicas',
      			audiovisual: 'audiovisual',
      			craftwork: 'artesania',
		        gastronomy: 'gastronomia',
      			health: 'salud y bienestar',
      			literature: 'literatura',
		        music: 'musica',
		        other: 'otros',
		        street_art: 'arte urbano',
      			visual: 'artes visuales',
		        festival: 'festival',
		        association:'asociacion', 
		        ngo:'ong', 
		        collective:'colectivo', 
		        interprise:'empresa', 
		        institution:'institucion',
		        federation: 'federacion',
		        foundation:'fundacion'
		      },
		      en:{
		        artist: 'artist',
		        space: 'space',
		        organization: 'organization',
		        open_air: 'open air',
		        cultural_ass: 'cultural space',
		        commercial: 'business',
		        home: 'private home',
		        arts: 'performing arts',
      			audiovisual: 'audiovisual',
      			craftwork: 'craftwork',
		        gastronomy: 'gastronomy',
      			health: 'health & wellness',
      			literature: 'literature',
		        music: 'music',
		        other: 'other',
		        street_art: 'street art',
      			visual: 'visual arts',
		        festival: 'festival',
		        association:'association', 
		        ngo:'ngo', 
		        collective:'collective', 
		        interprise:'enterprise', 
		        institution:'institution',
		        federation: 'federation',
		        foundation:'foundation'
		      },
		      ca:{
		        artist: 'artista',
		        space: 'espai',
		        organization: 'organitzacio',
		        open_air: 'espai exterior',
		        cultural_ass: 'espai cultural',
		        commercial: 'local comercial',
		        home: 'espai particular',
		        arts: 'arts esceniques',
      			audiovisual: 'audiovisual',
      			craftwork: 'artesania',
		        gastronomy: 'gastronomia',
      			health: 'salut i benestar',
      			literature: 'literatura',
		        music: 'musica',
		        other: 'altres',
		        street_art: 'art de carrer',
      			visual: 'arts visuals',
		        festival: 'festival',
		        association:'associacio', 
		        ngo:'ong', 
		        collective:'col·lectiu', 
		        interprise:'enterprise', 
		        institution:'institucio',
		        federation: 'federacio',
		        foundation:'fundacio' 
		      }
		    }
		    return dictionary[@lang][text.to_sym] if dictionary[@lang].has_key? text.to_sym
		    text
		  end

			def sort_results results
				sorted_results = []
				sorted_results.push(results.select{ |result| result[:type] == 'category'})
				sorted_results.push(results.select{ |result| result[:type] == 'name'})
				sorted_results.push(results.select{ |result| result[:type] == 'city'})
				sorted_results.push(results.select{ |result| result[:type] == 'title'})
				sorted_results.flatten
			end

			def order_results results
				results.sort_by{ |performance| [performance[:date], performance[:permanent] == 'false' ? 0 : 1, performance[:time].first, performance[:time].last] }
			end
		end
	end
end