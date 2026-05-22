# frozen_string_literal: true

class FormsController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:index]
  before_action :require_login!, except: [:index]

  # POST /forms/ (list forms for a call)
  def index
    check_call_exists!(params[:call_id])
    is_owner = call_owner?(params[:call_id]) == current_user_id || admin?
    forms = Actions::UserGetsForms.run(params[:call_id], params[:lang], current_user_id, is_owner)
    success(forms: forms)
  end

  # POST /forms/get_call_forms
  def get_call_forms
    check_call_ownership!(params[:call_id])
    forms = Repos::Forms.get({ call_id: params[:call_id] })
    success(forms: forms)
  end

  # POST /forms/create
  def create
    owner_id = check_call_ownership!(params[:call_id])
    form = Actions::UserCreatesForm.run(owner_id, params.to_unsafe_h)
    success(form: form)
  end

  # POST /forms/modify
  def update
    owner_id = check_form_ownership!(params[:id])
    form = Actions::UserModifiesForm.run(owner_id, params.to_unsafe_h)
    success(form: form)
  end

  # POST /forms/delete
  def destroy
    owner_id = check_form_ownership!(params[:id])
    Actions::UserDeletesForm.run(owner_id, params.to_unsafe_h)
    render json: { status: 'success' }
  end

  private

  def check_call_exists!(call_id)
    raise Pard::Invalid::UnexistingCall unless Repos::Calls.exists?(call_id)
  end

  def call_owner?(call_id)
    Repos::Calls.get_owner(call_id)
  end

  def check_call_ownership!(call_id)
    raise Pard::Invalid, 'non_existing_call' unless Repos::Calls.exists?(call_id)

    owner_id = Repos::Calls.get_owner(call_id)
    raise Pard::Invalid, 'call_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end

  def check_form_ownership!(form_id)
    raise Pard::Invalid, 'non_existing_form' unless Repos::Forms.exists?(form_id)

    owner_id = Repos::Forms.get_owner(form_id)
    raise Pard::Invalid, 'form_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end
end
