class Call

  def initialize user_id, params
    check_fields user_id, params
    @call = new_call user_id, params
    @params = params
  end


  def [] key
    call[key]
  end

  def to_h
    call.to_h
  end

  def create
    call[:whitelist] = []
    call.to_h 
  end

  private
  attr_reader :call, :params
  def new_call user_id, params

    keys = [
      :id,
      :user_id,
      :event_id,
      :profile_id,
      :start,
      :deadline, 
      :conditions, 
      :texts
    ]
    call = Hash[keys.map{|sym| [sym, params[sym]] if params.key?(sym.to_s) || params.key?(sym)}.compact] # This line is to allow modifying each field indipendently form the others
    call[:id] ||= SecureRandom.uuid  
    call[:user_id] ||= user_id
    call
  end

  def mandatory
    [ 
      :event_id,
      :profile_id,
      :start,
      :deadline
    ]
  end

  def check_fields user_id, params
    raise Pard::Invalid::Params if (
      mandatory.any?{|field| params[field].blank?}
    )
  end

    
end
