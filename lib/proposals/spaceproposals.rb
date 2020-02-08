class SpaceProposal

  def initialize params, form
    @form = form
    @params = params
    check_fields!
    @space_proposal = new_space_proposal
  end


  def [] key
    space_proposal[key]
  end

  def to_h
    space_proposal.to_h
  end

  private
  attr_reader :space_proposal, :form, :params

  def new_space_proposal
    keys = [:id, :profile_id, :event_id, :call_id, :space_id, :user_id, :subcategory, :other_categories, :other, :form_id, :own, :register_date, :space_name, :address, :type, :description, :plane_picture, :single_ambient, :ambients, :amend,:phone]
    newspaceproposal = Hash[keys.map{|sym| [sym, params[sym]] unless (params[sym].nil? || sym == :ambients)}.compact]
    newspaceproposal[:id] ||= SecureRandom.uuid
    newspaceproposal[:ambients] = params[:ambients].map {|ambient| Util.string_keyed_hash_to_symbolized(ambient)}
    form.each{ |field, content| 
      newspaceproposal[field] = params[field] unless (field == :ambient_info || params[field].nil?)}
    newspaceproposal
  end

  def check_fields!
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
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
      :address,
      :phone,
      :space_name
    ]
  end


  def correct_entry? value, type
    return !value.blank? if type == 'mandatory'
    true
  end

end


class SpaceOwnProposal

  def initialize params, form
    @form = form
    @params = params
    check_fields!
    @space_proposal = new_own_proposal
  end

  def [] key
    space_proposal[key]
  end

  def to_h
    space_proposal.to_h
  end

  private
  attr_reader :space_proposal, :form, :params
  
  def check_fields!
     raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
  end

  def mandatory
    [ 
      :call_id, 
      :event_id,
      :subcategory,
      :form_id,
      :address,
      :space_name,
      :name,
      :phone,
      :email
    ]
  end

  def new_own_proposal
    keys = [:id, :profile_id, :event_id, :call_id, :space_id, :user_id, :subcategory, :other_categories, :other, :form_id, :own, :register_date, :space_name, :address, :type, :description, :plane_picture, :single_ambient, :ambients, :amend, :phone]
    newspaceproposal = Hash[keys.map{|sym| [sym, params[sym]] unless (params[sym].nil? || sym == :ambients)}.compact]
    newspaceproposal[:ambients] = params[:ambients].map {|ambient| Util.string_keyed_hash_to_symbolized(ambient)}
    form.each{ |field, content| newspaceproposal[field] = params[field] unless (field == :ambient_info || params[field].nil?)}
    newspaceproposal[:id] ||= SecureRandom.uuid
    newspaceproposal[:profile_id] ||= SecureRandom.uuid
    newspaceproposal[:own] = true
    newspaceproposal
  end


end

