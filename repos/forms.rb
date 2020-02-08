module ExtraReposMethods
  module Forms
    
      def get_form_blocks id
        form = Repos::Forms.get_by_id id
        raise Pard::Invalid::UnexistingForm if form.blank?
        form[:blocks].values.first
      end

    end
  end
