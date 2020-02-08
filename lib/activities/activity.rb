class Activity

  def initialize params
  	check_fields! params
    @activity = new_activity params
  end

  def [] key
    activity[key]
  end

  def to_h
    activity.to_h
  end

  private
  attr_reader :activity
  
  def check_fields! params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
    raise Pard::Invalid::DateTime if Util.arrayify_hash(params[:dateTime]).any?{ |dt| 
      [:time, :date].any?{ |field|
        dt[field].blank?
      }
    }
  end


  def mandatory
    [  
      :participant_id,
      :host_id,
      :dateTime,
      :permanent
    ]
  end

  # def alternative_mandatory_field
  #   [
  #     :participant_name,
  #     :host_name,
  #     :address
  #   ]
  # end

  def new_activity params
    keys = [
      :id, 
      :participant_id, 
      :host_id, 
      :participant_proposal_id, 
      :host_proposal_id, 
      :space_id, 
      :event_id, 
      :program_id, 
      :confirmed, 
      :permanent, 
      :price, 
      :comments,
      :participant_category,
      :participant_subcategory,
      :title,
      :children
    ]
    activity = Hash[keys.map{|sym| [sym, params[sym]] unless params[sym].nil? }.compact]
    activity[:id] ||= SecureRandom.uuid
    activity[:dateTime] = Util.arrayify_hash(params[:dateTime]).map do |act|
      act[:id_time] ||= SecureRandom.uuid 
      act
    end
    activity[:short_description] = params[:short_description] unless params[:short_description].blank? || params[:short_description].size > 140
    activity
  end
  

end    