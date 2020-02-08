class FreeBlock

  def initialize user_id, params
    check_fields params
    @free_block = new_free_block user_id, params
  end

  def check_fields params
  raise Pard::Invalid::Params if mandatory(params).any?{ |field|
    params[field].blank?
  }
  end

  def [] key
    free_block[key]
  end

  def to_h
    free_block.to_h
  end

  private
  attr_reader :free_block
  def new_free_block user_id, params
    {
      user_id: user_id,
      profile_id: params[:profile_id],
      id: params[:id] || SecureRandom.uuid,
      name: params[:name],
      description: params[:description],
      links: params[:links],
      photos: params[:photos],
      buttons: params[:buttons]
    }
  end

  def mandatory params
    [
      :name
    ]
  end
end
