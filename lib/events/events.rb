class Event

  def initialize user_id, params
    check_fields user_id, params
    @event = new_event user_id, params
  end


  def [] key
    event[key]
  end

  def to_h
    event.to_h
  end

  def make_professional
    event[:professional] = true
  end

  def make_no_professional
    event[:professional] = false
  end

  private
  attr_reader :event
  def new_event user_id, params
    keys = [
      :id,
      :user_id,
      :profile_id,
      :call_id, 
      :program_id,
      :name, 
      :texts,
      :type,
      :img, 
      :qr, 
      :place, 
      :address,
      :partners, 
      :eventTime, 
      :categories, 
      :slug
      # :price, 
      # :ticket_url,
      # :default_lang
    ]
    event = Hash[keys.map{|sym| [sym, params[sym]] if params.key?(sym.to_s) || params.key?(sym)}.compact] # This line is to allow modifying each field indipendently form the others  
    event[:id] ||= SecureRandom.uuid
    event[:user_id] ||= user_id
    event[:eventTime] = Util.arrayify_hash(event[:eventTime])
    event
  end

  def mandatory
    [ 
      # :profile_id, ---> Already checked by check_profile_ownership! in controller
      :name, 
      :texts,
      :eventTime,
      :categories,
      :place,
      :type
    ]
  end

  def check_fields user_id, params
    raise Pard::Invalid::Params if (
      mandatory.any?{|field| params[field].blank?}
    )
  end

    
end
