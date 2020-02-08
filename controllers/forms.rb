class FormsController < BaseController

  post '/' do
    scopify :call_id, :lang
    check_call_exists! call_id
    is_owner = true if (call_owner?(call_id) == session[:identity] || admin?)
    forms = Actions::UserGetsForms.run call_id, lang, session[:identity], is_owner
    success({forms: forms})
  end

  post '/get_call_forms' do
    scopify :call_id
    check_call_exists! call_id
    forms = Repos::Forms.get({call_id: call_id})
    success({forms: forms})
  end

  post '/create' do
    scopify :call_id
    owner_id = check_call_ownership! call_id
    form = Actions::UserCreatesForm.run owner_id, params
    success({form: form})
  end

  post '/modify' do
    scopify :id
    owner_id = check_form_ownership! id
    form = Actions::UserModifiesForm.run owner_id, params
    success({form: form})
  end

  post '/delete' do
    scopify :id
    owner_id = check_form_ownership! id
    form = Actions::UserDeletesForm.run owner_id, params
    success
  end


  private

  def check_call_exists! call_id
    raise Pard::Invalid::UnexistingCall unless Repos::Calls.exists? call_id
  end
  
  def call_owner? call_id
    Repos::Calls.get_owner call_id
  end
  
  def check_form_ownership! form_id
    raise Pard::Invalid.new 'non_existing_form' unless Repos::Forms.exists? form_id
    owner_id = Repos::Forms.get_owner(form_id)
    raise Pard::Invalid.new 'form_ownership' unless (owner_id == session[:identity] || admin?)
    owner_id 
  end

end
