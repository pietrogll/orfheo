class User

  def initialize params
    @user = new_user params
  end

  def [] key
    @user[key]
  end

  def to_h
    @user.to_h
  end

  private
  def new_user params
    encrypted_passwd = Services::Encryptor.encrypt(params[:password])
    user_id = SecureRandom.uuid
    validation_code = SecureRandom.uuid
    new_u = {
      id: user_id,
      email: params[:email].downcase,
      password: encrypted_passwd,
      lang: params[:lang],
      validation: false,
      validation_code: validation_code,
      register_date: Time.now.to_i * 1000
    }
    new_u[:interests] = params[:notification].is_true? ? {event_call: {categories: ApiStorage.production_categories}} : {event_call: {categories: ""}}
    new_u
  end
end
