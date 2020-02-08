class Profile

  def initialize user_id, params
    check_fields user_id, params

    @profile = new_profile user_id, params
  end

  def check_fields user_id, params
    raise Pard::Invalid::Params if (
      mandatory.any?{|field| params[field].blank?} || 
      [:postal_code,:locality].any?{|field| params[:address][field].blank?} || 
      invalid_email?(params[:email][:value])
    )
    raise Pard::Invalid::ExistingName unless Actions::UserChecksName.run(user_id, params[:name], params[:id])
  end

  def [] key
    profile[key]
  end

  def to_h
    profile.to_h
  end

  private
  attr_reader :profile
  def new_profile user_id, params
    {
      user_id: user_id,
      id: params[:id] || SecureRandom.uuid,
      facets: params[:facets],
      tags: params[:tags],
      name: params[:name],
      email: params[:email],     #added
      profile_picture: params[:profile_picture],
      address: params[:address],
      description: params[:description],
      short_description: params[:short_description],
      personal_web: params[:personal_web],
      color: params[:color],
      phone: params[:phone],
      buttons: params[:buttons],
      menu: params[:menu] || [     #added
        "free_block", 
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: relations_same(user_id, params[:id])
    }
  end

  def mandatory
    [
      :name,
      :address,
      :color,
      :email, #added
      :facets #added
    ]
  end

  def invalid_email? email
    (email =~ /\A[\w+\-.]+@[a-z\d\-]+(\.[a-z]+)*\.[a-z]+\z/i).nil?
  end

  def relations_same user_id, profile_id = false
    user_profiles = Repos::Profiles.get_user_profiles user_id
    if profile_id
      return user_profiles.blank? ? [] : user_profiles.inject([]){|relations, user_profile| profile_id == user_profile[:id] ? relations : relations.push(user_profile.slice(:id, :name, :color))}     
    else
    user_profiles.blank? ? [] : user_profiles.inject([]){|relations, user_profile| relations.push(user_profile.slice(:id, :name, :color))}
    end
  end

    
end
