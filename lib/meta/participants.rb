class Participant

  def initialize params, owner_id = nil
    check_fields! params
    @owner_id = owner_id
    @params = params
    @participant = {}
  end

  def create
    new_participant params, owner_id
  end

  def modify
    modified_participant params
  end

  def [] key
    participant[key]
  end

  def to_h
    participant.to_h
  end



  private
  attr_reader :participant, :owner_id, :params

  def new_participant params, owner_id
    {
      id: params[:id] || SecureRandom.uuid,
      email: {value: params[:email].downcase, visible: false},
      name: params[:name],
      address: params[:address],
      phone: params[:phone],
      facets: params[:facets],
      color: params[:color],
      user_id: params[:user_id] || owner_id
    }
  end

  def modified_participant params
    keys = [
      :id,
      :email,
      :name,
      :address,
      :phone,
      :facets,
      :color
    ]
    participant = Hash[keys.map{|sym| [sym, params[sym]] unless params[sym].nil? }.compact]
    participant[:email] = {value: params[:email].downcase, visible: false} unless params[:email].nil?
    participant 
  end

  def check_fields! params
    raise Pard::Invalid::Params if mandatory.any?{ |field|
      params[field].blank?
    }
    raise Pard::Invalid::Params if params[:phone][:value].blank?
    raise Pard::Invalid::ExistingName unless Actions::CheckParticipantName.run(params[:name], params[:call_id], params[:program_id], params[:profile_id])
  end

  def mandatory
    [
      :name,
      :phone,
      :email
    ]
  end


end
