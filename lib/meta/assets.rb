class Asset

  def initialize url, holder_id
    # check_fields params
    asset = {
      url: url,
      holders: [holder_id]
    }
    asset = MetaRepos::Assets.mapped_class.from_hash(asset)
    asset.id = SecureRandom.uuid
    @asset = asset
  end

  # def check_fields params
  #   raise Pard::Invalid::Params if mandatory.any?{ |field|
  #     params[field].blank?
  #   }
  # end

  def [] key
    asset[key]
  end

  def to_h
    asset.to_h
  end

  private
  attr_reader :asset



end
