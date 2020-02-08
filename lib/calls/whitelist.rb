class Whitelist

  def initialize call_id, params
    check_fields! params
    @call = Repos::Calls.get_by_id call_id
    whitelisted = new_whitelisted params
    @whitelist = new_whitelist whitelisted
  end

  def check_fields! params
  raise Pard::Invalid::Params if mandatory.any?{ |field|
    params[field].blank?
  }
  end

  def to_a
    @whitelist    
  end

  private
  attr_reader :whitelist, :call
  def new_whitelist whitelisted
    call[:whitelist] ||= []
    call[:whitelist].reject!{ |participant| participant[:email].downcase == whitelisted[:email]}
    call[:whitelist].push(whitelisted)
    call[:whitelist]
  end

  def new_whitelisted params
    {
      name_email: params[:name_email],
      email: params[:email].downcase
    }
  end

  def mandatory
    [
      :name_email,
      :email
    ]
  end
end
