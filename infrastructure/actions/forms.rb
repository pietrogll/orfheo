module Actions

  class UserCreatesForm

    def self.run owner_id, params
      formManager = FormsManager.new owner_id, params
      form = formManager.create
      Repos::Calls.add_form(form[:call_id], form[:id])
      form
    end

  end


  class UserModifiesForm

    def self.run owner_id, params
      formManager = FormsManager.new owner_id, params
      form = formManager.modify
    end

  end


  class UserDeletesForm

    def self.run owner_id, params
      formManager = FormsManager.new owner_id, params
      remove_from_call params[:id]
      formManager.delete
    end

    def self.remove_from_call form_id
      call_id = Repos::Forms.get_by_id(form_id)[:call_id]
      Repos::Calls.remove_form call_id, form_id
    end

  end

  class UserGetsForms
    
    def self.run call_id, lang, user_id, is_owner = nil
      forms = get_forms call_id, lang, user_id, is_owner
      forms[:texts] = get_call_texts call_id, lang
      forms
    end

    def self.get_forms call_id, lang, user_id, is_owner
      forms = Repos::Forms.get({call_id: call_id})
      forms = filter(forms, user_id, call_id) unless is_owner
      arrange(forms, lang)
    end

    def self.get_call_texts call_id, lang
      call = Repos::Calls.get_by_id(call_id)
      Actions::GetByLang.run(call, :texts, lang) 
    end

    private

    def self.arrange forms, lang
      forms.inject({}) do |forms_obj, form|
        forms_obj[form[:type]] ||= {}
        forms_obj[form[:type]][form[:id]] = {
          type: form[:type],
          form_id: form[:id],
          blocks: Actions::GetByLang.run(form, :blocks, lang),
          texts: Actions::GetByLang.run(form, :texts, lang),
          widgets: Actions::GetByLang.run(form, :widgets, lang)
        }
        forms_obj 
      end unless forms.blank?
    end

    def self.filter forms, user_id, call_id
      forms.reject! do |form|
        next if form[:own].blank?
        form[:own] == 'own' || (form[:own] == 'private' && !is_whitelisted(user_id, call_id))
      end
      forms
    end

    def self.is_whitelisted user_id, call_id
      whitelist = Repos::Calls.get_whitelist call_id
      return false unless whitelist && !whitelist.empty?
      email = Repos::Users.get_by_id(user_id)[:email]
      whitelist.map{|el|el[:email]}.include?(email)
    end

  end

end

