module Services
  class Gallery
    class << self

      def delete_space_proposal_pictures space_proposal
        unused = get_space_proposal_picures space_proposal
        delete_pictures unused, space_proposal[:id]
      end

      def get_space_proposal_picures space_proposal
        unused = get_unused_pictures(get_pictures(space_proposal),{})
        space_proposal[:ambients] = space_proposal[:ambients].values if space_proposal[:ambients].is_a? Hash
        unused += space_proposal[:ambients].inject([]) do |unused_ambients_pictures, ambient|
          unused_ambients_pictures += get_unused_pictures(get_pictures(ambient),{})
        end if space_proposal[:ambients]
        unused
      end


      def delete_pictures unused_pictures, holder_id
        delete_update unused_pictures, holder_id unless unused_pictures.blank?
      end

      def update_pictures gallery_id, gallery = {}
        old_pictures = gallery_old_pictures gallery_id
        new_pictures = get_pictures gallery
        Services::Assets.create new_pictures, gallery_id unless new_pictures.blank?
        unused_pictures = get_unused_pictures old_pictures, new_pictures
        delete_update unused_pictures, gallery_id unless unused_pictures.blank?
      end

      def compare_and_delete_unused_pictures new_element, old_element
        old_pictures = get_pictures old_element
        new_pictures = get_pictures new_element
        unused_pictures = get_unused_pictures old_pictures, new_pictures
        permanently_delete_unused unused_pictures
      end


      def get_photos_array params        
        pictures_fields.inject([]) do |photos_array, field|
          photos_array.concat(params[field]) unless params[field].blank? || !params[field].is_a?(Array)
          photos_array
        end
      end


      def get_photos_from_form proposal, form = nil
        form ||= get_form_blocks proposal
        form.inject([]) do |photos, (k, v)|
          photos.push(proposal[k]) if (k.to_s.numeric? && is_upload_field?(v[:input]))
          photos = photos + get_photos_from_form(proposal[k], v[:args].values.first) if (k.to_s.numeric? && v[:input] == 'SummableInputs' && proposal[k])
          photos.push(proposal[k][:img]) if (k.to_s.numeric? && v[:input] == 'LinkUploadPDF' && !proposal[k].blank?)
          photos.flatten.compact
        end
      end

      def permanently_delete_unused pictures
        Cloudinary::Api.delete_resources(pictures) unless pictures.blank?
      end

      
      private

      def pictures_fields
        [
          :profile_picture, 
          :photos, 
          :plane_picture, 
          :img #event main picture
        ]
      end
     
      def get_pictures element
        return {} if element.blank?
        pictures_fields.map{ |field|
          [field, element[field]] unless element[field].blank?
          }.compact.to_h
      end

     
      def gallery_old_pictures gallery_id
        gallery = MetaRepos::Galleries.get({id: gallery_id}).first
        get_pictures gallery
      end

      def get_unused_pictures old_pictures, new_pictures
        return [] if old_pictures.blank?
        unused_pictures = old_pictures.keys.map{ |field|
          next if old_pictures[field].blank?
          next old_pictures[field] if new_pictures[field].blank?
          old_pictures[field].reject{ |picture|
            new_pictures[field].include? picture
          }
        }.compact.flatten
        
      end

      def delete_update  unused_pictures, holder_id
        unused_assets = Services::Assets.update unused_pictures, holder_id
        permanently_delete_unused unused_assets
      end

      def get_form_blocks params
        Repos::Forms.get_form_blocks params[:form_id]
      end

      def is_upload_field? field
        field == 'UploadPhotos' || field == 'UploadPDF'
      end

    end
  end
end
