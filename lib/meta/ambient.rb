class Ambient

  def initialize user_id, params
    check_fields params
    new_ambient = MetaRepos::Ambients.mapped_class.from_hash(params)
    new_ambient.id = SecureRandom.uuid unless new_ambient.id
    new_ambient.user_id = user_id
    @ambient = new_ambient
  end

  def check_fields params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
  end

  def [] key
    ambient[key]
  end

  def to_h
    ambient.to_h
  end

  private
  attr_reader :ambient



  def mandatory
    [
      :name,
      :description,
      :allowed_formats,
      :allowed_categories
    ]
  end

end
