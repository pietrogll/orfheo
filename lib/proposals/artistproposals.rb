class ArtistProposal

  def initialize params, form
    @form = form
    @params = params
    check_fields!
    @artist_proposal = new_artist_proposal
  end


  def [] key
    artist_proposal[key]
  end

  def to_h
    artist_proposal.to_h
  end

  private
  attr_reader :artist_proposal, :form, :params

  def new_artist_proposal
    keys = [:id, :profile_id, :event_id, :call_id, :production_id, :user_id, :subcategory, :other_categories, :other, :form_id, :own, :register_date, :category, :format, :title, :short_description, :description, :duration, :photos, :links, :cache, :children, :phone]
    artist_proposal = Hash[keys.map{|sym| [sym, params[sym]] unless params[sym].nil?}.compact]
    artist_proposal[:id] ||= SecureRandom.uuid
    form.each{ |field, content| artist_proposal[field] = params[field] unless  params[field].nil?}
    artist_proposal
  end

  def check_fields!
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
    raise Pard::Invalid::Category unless correct_category? params[:category]
    raise Pard::Invalid::Params unless form.except(:email).all?{ |field, entry|
      correct_entry? params[field], entry[:type]
    }
  end

  def mandatory
    [ 
      :profile_id,
      :call_id, 
      :event_id,
      :subcategory,
      :form_id, 
      :title,
      :phone,
      :short_description
    ]
  end


  def correct_entry? value, type
    return !value.blank? if type == 'mandatory'
    true
  end

  def correct_category? category
    ApiStorage.production_categories.include? category
  end

end


class ArtistOwnProposal

  def initialize params, form
    @form = form
    @params = params
    check_fields!
    @artist_proposal = new_own_proposal
  end

  def [] key
    artist_proposal[key]
  end

  def to_h
    artist_proposal.to_h
  end

  private
  attr_reader :artist_proposal, :form, :params
  
  def check_fields!
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
    raise Pard::Invalid::Category unless correct_category? params[:category]
  end

  def mandatory
    [ 
      :call_id, 
      :event_id,
      :subcategory,
      :form_id, 
      :name,
      :email,
      :title,
      :phone,
      :short_description
    ]
  end

  def new_own_proposal
    keys = [:id, :profile_id, :event_id, :call_id, :subcategory, :other_categories, :other, :form_id, :register_date, :category, :format, :title, :short_description, :description, :duration, :photos, :links, :cache, :children, :phone, :user_id]
    proposal = Hash[keys.map{|sym| [sym, params[sym]] unless params[sym].nil?}.compact]
    form.each{ |field, content| proposal[field] = params[field] unless  params[field].nil?}
    proposal[:id] ||= SecureRandom.uuid
    proposal[:profile_id] ||= SecureRandom.uuid
    proposal[:own] = true
    proposal
  end

  def correct_category? category
    ApiStorage.production_categories.include? category
  end

end

