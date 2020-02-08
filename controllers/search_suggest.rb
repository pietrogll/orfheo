class SearchController < BaseController
  @lang = Dictionary.default_language


  post '/suggest' do
    scopify :query, :event_id, :lang
    check_lang! lang
    @lang = lang.to_sym
    queriable_tags = get_query query
    tags = queriable_tags[0...-1]
    matched_profiles = query_profiles get_profiles(event_id), tags
    results = get_suggestions_for matched_profiles, queriable_tags
    results = sort_results results
    success({items: results})
  end


  post '/results' do
    scopify :query, :shown, :event_id, :lang
    check_lang! lang
    @lang = lang.to_sym
    tags = get_query query
    shown_profiles = check_params shown
    not_shown = not_shown_profiles get_profiles(event_id), shown_profiles
    matched_profiles = query_profiles not_shown, tags
    success({profiles: matched_profiles.take(15)})
  end

  post '/suggest_program' do
    scopify :query, :event_id, :filters, :lang
    queriable_tags = get_query query
    queriable_filters = get_filters filters
    before_time = (Time.now.to_f * 1000.0).to_i
    results = Services::Search.get_program_suggestions lang, event_id, queriable_tags, queriable_filters
    after_time = (Time.now.to_f * 1000.0).to_i
    success({items: results})
  end

  post '/results_program' do
    scopify :query, :event_id, :filters, :date, :time, :lang
    tags = get_query query
    queriable_filters = get_filters filters
    results = Services::Search.get_program_results lang, event_id, tags, queriable_filters, date, time
    hosts = Services::Events.get_event_program_hosts event_id
    success({program: results, hosts: hosts})
  end

  post '/suggest_tags' do
    scopify :query, :source
    results = Services::Suggest.tag_texts query, source
    success({items: results})
  end

  post '/suggest_event_names' do
    scopify :query
    results = Services::Suggest.event_names query
    success({items: results})
  end

  private

  def get_query params
    return [] if params.blank?
    check_params params
    params.map{|param| I18n.transliterate(param).downcase}
  end

  def get_filters params
    return {} if params.blank?
    raise Pard::Invalid::FilterParams unless params.is_a?(Hash) && params.values.all?{ |selections| selections.is_a?(Array)}
    params = Util.string_keyed_hash_to_symbolized params
    params.map{ |key, value|
      [key, value]
    }.to_h
  end

  def check_params params
    return [] if params.blank?
    raise Pard::Invalid::QueryParams unless params.is_a?(Array) && params.all?{ |param| param.is_a? String}
    params
  end


  def get_profiles event_id
    profiles = event_id.blank? ? Repos::Profiles.all : Repos::Profiles.get_event_profiles(event_id)
    filteredProfiles = profiles.map{ |profile| 
      profile = Actions::FilterProfile.run(profile)
      profile[:tags] = Actions::UserGetsTextTags.of profile
      profile
    }
    shuffledProfiles = filteredProfiles.shuffle
  end

  def query_profiles all_profiles, tags
    return all_profiles if tags.all?{ |tag| tag.blank?}
    all_profiles.select{ |profile|
      query_profile(profile, tags)
    }
  end
  
  def query_profile profile, tags
    tags.all?{ |tag|
      check_profile(profile, tag) 
    }
  end

  def check_profile profile, tag
    return check_value profile[:facets], tag if facet?(tag)
    # return check_value profile[:category], tag if category?(tag)
    searcheable_fields.any?{ |field|
      check_value profile[field], tag
    }
  end

  def check_productions profile, tag
    return false unless profile.has_key? :productions
    return false if facets?(tag)

    if category? tag
      return profile[:productions].any?{ |production|
        check_value production[:category], tag
      }
    end

    searcheable_production_fields.any?{ |field|
      profile[:productions].any?{ |production|
        check_value production[field], tag
      }
    }
  end

  def check_value value, tag
    return check_hash(value, tag) if value.is_a? Hash
    return check_array(value, tag) if value.is_a? Array
    matches?(value, tag) if value.is_a? String
  end

  def check_hash value, tag
    value.keys.any?{ |key|
      check_value(value[key], tag)}
  end

  def check_array value, tag
    value.any?{|val| check_value(val, tag)}
  end

  def queriable? value, query
    return false if value.nil?
    tags = query[0...-1]
    return false if tags.any? { |tag| tag == translate(I18n.transliterate(value).downcase)}
    matches? value, query.last
  end

  def matches? value, tag
    matchable_value = translate(I18n.transliterate(value).downcase)
    words = matchable_value.split(/\W+/).map{ |word| translate(word).split(/\W+/)}.flatten
    matchable_value == tag || words.any?{ |word|
      word.start_with? tag  
    }
  end

  def searcheable_fields
    [
      :facets,
      :name,
      :bio,
      :address,
      :tags
    ]
  end

  def searcheable_production_fields
    [
      :category,
      :title,
      :description,
      :short_description
    ]
  end

  def not_shown_profiles profiles, shown
    not_shown = profiles.reject{ |profile| shown.include? profile[:id]}
    not_shown.sort_by { |profile| (profile[:profile_picture].blank? && profile[:photos].blank?) ? 1 : 0}
  end

  def get_suggestions_for matched_profiles, query
    suggestions = []
    return suggestions if query.last.blank?
    matched_profiles.each{ |profile|
      add_suggestions suggestions, profile, query  
    }
    suggestions
  end

  def add_suggestions suggestions, profile, query
    if(profile[:facets].any?{|facet| queriable? facet, query })
      profile[:facets].each{|facet| add_suggestion(suggestions, facet, 'facet') if queriable? facet, query }
    end 
    add_suggestion(suggestions, profile[:name], 'name') if queriable? profile[:name], query
    add_suggestion(suggestions, profile[:address][:locality], 'city') if queriable? profile[:address][:locality], query
    # add_artist_suggestions(suggestions, profile, query) if profile[:type] == 'artist'
    # add_space_suggestions(suggestions, profile, query) if profile[:type] == 'space'
  end

  def add_artist_suggestions suggestions, profile, query
    add_suggestion(suggestions, profile[:city], 'city') if queriable? profile[:city], query
    add_production_suggestions(suggestions, profile[:productions], query) if profile.has_key? :productions
  end

  def add_production_suggestions suggestions, productions, query
    productions.each{ |production|
      add_suggestion(suggestions, production[:title], 'title') if queriable? production[:title], query
      add_suggestion(suggestions, production[:category], 'category') if queriable? production[:category], query
    }
  end

  def add_space_suggestions suggestions, profile, query
    add_suggestion(suggestions, profile[:category], 'category') if queriable? profile[:category], query
    add_suggestion(suggestions, profile[:address][:locality], 'city') if queriable? profile[:address][:locality], query
  end

  def add_suggestion suggestions, text, type
    translation = I18n.transliterate(translate text)
    suggestions.push({id: translation, text: translation, type: type, icon: text}) unless suggestions.any?{ |suggestion| suggestion[:text].downcase == I18n.transliterate(translation).downcase}
  end

  def sort_results results
    sorted_results = []
    sorted_results.push(results.select{ |result| result[:type] == 'facet'})
    sorted_results.push(results.select{ |result| result[:type] == 'category'})
    sorted_results.push(results.select{ |result| result[:type] == 'city'})
    sorted_results.push(results.select{ |result| result[:type] == 'name'})
    sorted_results.push(results.select{ |result| result[:type] == 'title'})
    sorted_results.flatten
  end

  def facet? text
    dictionary = {
      es: [
        'espacio cultural',
        'local comercial',
        'espacio particular',
        'espacio exterior',
        'artista',
        'creativo',
        'artesano',
        'gestor',
        'comisario',
        'político',
        'investigador',
        'critico',
        'productora',
        'coleccionista',
        'profesor',
        'inventor',
        'arquitecto', 
        'asociación',
        'ong',
        'colectivo',
        'empresa',
        'institución',
        'federación',
        'fundación',
        'otro'
      ],
      en: [
        "cultural space",
        "business",
        "private home",
        "open air",
        'artist',
        'creative',
        'craftsman',
        'manager',
        'commissar',
        'politician',
        'researcher',
        'critic',
        'producer',
        'collector',
        'professor',
        'inventor',
        'arquitect', 
        'association',
        "ngo",
        "collective",
        "enterprise",
        "institution",
        "federation",
        "foundation",
        'other'
      ],
      ca: [
        'espai cultural',
        'local comercial',
        'espai particular',
        'espai exterior',
        'festival',
        'artista',
        'creatiu',
        'artesà',
        'gestor',
        'comissari',
        'polític',
        'investigador',
        'crític',
        'productora',
        'col·leccionista',
        'professor',
        'inventor',
        'arquitecto',
        'associació',
        'ong',
        'col·lectiu',
        'empresa',
        'institució',
        'federació',
        'fundació',
        'altre',
        'espai',
        'agent',
        'organització'
      ]
    }
    dictionary[@lang].include? text
  end

  def category? text
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
        'artes visuales',
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
        'performing arts',
        'audiovisual',
        'craftwork',
        'gastronomy',
        'health & wellness',
        'literature',
        'music',
        'other',
        'street art',
        'visual arts',
        'festival',
        'association', 
        'ngo', 
        'collective', 
        'enterprise', 
        'institution',
        'federation',
        'foundation'
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
        'arts visuals',
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

  def translate text
    dictionary = {
      es: {
        # facet: 'facet',
        # other_facet: 'other-facet',

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
        # facet: 'facet',
        # other_facet: 'other-facet',
        
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
        # facet: 'facet',
        # other_facet: 'other-facet',
        
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
end
