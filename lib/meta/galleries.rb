class Gallery

  def initialize params, source #has the same id of the corresponding element
    check_fields params
    return @gallery = {} if needed.all?{|field| params[field].blank?}
    gallery = MetaRepos::Galleries.mapped_class.from_hash(params)
    gallery.profile_id = params[:profile_id] || params[:id]
    gallery.name = params[:name] || params[:title]
    gallery.photos = get_photos params
    gallery.source = source
    @gallery = gallery
  end

  def check_fields params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
  end

  def get_photos params
   Services::Gallery.get_photos_array params
  end

  def [] key
    gallery[key]
  end

  def to_h
    gallery.to_h
  end

  private
  attr_reader :gallery

  def needed
    [
      :photos,
      :links,
      :profile_picture, 
      :plane_picture,
      :img
    ]
  end

  def mandatory
    [
      :id
    ]
  end


end
