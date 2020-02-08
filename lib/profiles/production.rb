class Production

  def initialize user_id, params
    check_fields params
    @production = new_production user_id, params
  end

  def check_fields params
    raise Pard::Invalid::Params if mandatory(params).any?{ |field|
      params[field].blank?
    }
    raise Pard::Invalid::Category unless correct_category? params[:category]
  end

  def [] key
    production[key]
  end

  def to_h
    production.to_h
  end

  private
  attr_reader :production
  def new_production user_id, params
    photos = params[:photos] || []
    main_picture = params[:main_picture] || [photos[0]].compact
    {
      user_id: user_id,
      profile_id: params[:profile_id],
      id: params[:id] || SecureRandom.uuid,
      main_picture: main_picture,
      format: params[:format],
      category: params[:category],
      title: params[:title],
      tags: params[:tags],
      description: params[:description],
      short_description: params[:short_description],
      duration: params[:duration],
      photos: params[:photos],
      links: params[:links],
      children: params[:children],
      cache: params[:cache] || {value: nil, visible: false, comment: nil}
    }
  end

  def mandatory params
    [ 
      :profile_id,
      :format,
      :category,
      :title,
      :description,
      :short_description
    ]
  end

  def correct_category? category
    ApiStorage.production_categories.include? category
  end
end
