class Tag

  def initialize i_tag, holder_id, source
    # check_fields params
    tag = {
      holders:[holder_id],
      source: source,
      text: i_tag
    }
    return @tag = {} if i_tag.blank?
    tag = MetaRepos::Tags.mapped_class.from_hash(tag)
    tag.id = SecureRandom.uuid
    @tag = tag
  end

  # def check_fields params
  #   raise Pard::Invalid::Params if mandatory.any?{ |field|
  #     params[field].blank?
  #   }
  # end

  def [] key
    tag[key]
  end

  def to_h
    tag.to_h
  end

  private
  attr_reader :tag

  def needed
    [
      :tag
    ]
  end


end
