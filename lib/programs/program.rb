class Program

  def initialize user_id, params	
    @program = new_program user_id, params
    @params = params
  end

  def [] key
    program[key]
  end

  def to_h
    program.to_h
  end

  def create
    check_fields! params
    program[:activities] = params[:activities] || []
    program[:participants] = params[:participants] || [] # profile_id of all the profiles that participate to an activity
    program[:order] = params[:order] || []
    program[:published] = params[:published] || false
    program.to_h
  end


  private
  attr_reader :program, :params
  
  def check_fields! params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
  end

  def mandatory
    [  
      :event_id,
      :subcategories,
      :texts
    ]
  end

  def new_program user_id, params
    keys = [
      :id,
      :event_id, 
      :subcategories, 
      :texts,
      :display_program,
      :permanents
    ]
    program = Hash[keys.map{|sym| [sym, params[sym]] if params.key?(sym.to_s) || params.key?(sym)}.compact]
    program[:id] ||= SecureRandom.uuid
    program[:user_id] ||= user_id
    program[:permanents] = Util.arrayify_hash(program[:permanents]) if (program[:permanents])
    program
  end
  

end    

