class Space

  def initialize user_id, params
    check_fields params
    @space = new_space user_id, params
  end

  def check_fields params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
  end

  def [] key
    space[key]
  end

  def to_h
    space.to_h
  end

  private
  attr_reader :space
  def new_space user_id, params
    main_picture = params[:main_picture].blank? ? params[:main_picture] : get_main_picture(params[:ambients])
    new_space = {
      user_id: user_id,
      profile_id: params[:profile_id],
      id: params[:id] || SecureRandom.uuid,
      name: params[:name],
      type: params[:type],
      address: params[:address],
      description: params[:description],
      size: params[:size],
      plane_picture: params[:plane_picture],
      main_picture: main_picture,
      human_resources: params[:human_resources],
      materials: params[:materials],
      accessibility: params[:accessibility],
      rules: params[:rules],
      single_ambient: params[:single_ambient]
    }
    # new_space[:ambients] = params[:single_ambient].is_true? ? ambients(params[:ambients], new_space[:id]) : ambients(params[:ambients])
    # new_space
  end

  # def ambients ambients_params, space_id = nil
  #   ambients_params = ambients_params.values if ambients_params.is_a?(Hash) 
  #   ambients_params.map do |ambient_params|  
  #     raise Pard::Invalid::Params if mandatory_ambient.any?{ |field|ambient_params[field].blank?}
  #     new_ambient(ambient_params, space_id) 
  #   end
  # end

  def get_main_picture ambients_params
    ambients_params = ambients_params.values if ambients_params.is_a?(Hash) 
    [ambients_params.reduce([]){|all_photos, ambient| 
      ambient_photos = ambient[:photos] ||  []
      all_photos + ambient_photos
    }.first].compact
  end

  def new_ambient ambient_params, space_id
    {
      id: ambient_params[:id] || SecureRandom.uuid,
      name: ambient_params[:name],
      description: ambient_params[:description],
      size: ambient_params[:size],
      tech_specs: ambient_params[:tech_specs],
      tech_poss: ambient_params[:tech_poss],
      floor: ambient_params[:floor],
      height: ambient_params[:height],
      capacity: ambient_params[:capacity],
      allowed_categories: ambient_params[:allowed_categories],
      allowed_formats: ambient_params[:allowed_formats],
      links: ambient_params[:links],
      photos: ambient_params[:photos]
    }
  end


  def mandatory
    [
      :profile_id,
      :name,
      :address,
      :description,
      :type,
      :ambients
    ]
  end

  def mandatory_ambient
    [
      :name,
      :description,
      :allowed_formats,
      :allowed_categories
    ]
  end

end
