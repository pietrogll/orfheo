module Actions

  class UserCreatesTags
  	def self.run params, source
      return nil if params[:tags].blank?
      tags = get_tags_ids params[:id], params[:tags], source
      tags.uniq
    end

    private

    def self.get_saved_tag tag
      saved_tag = MetaRepos::Tags.get(id: tag)
      saved_tag = MetaRepos::Tags.get(text: tag) if saved_tag.blank?
      saved_tag.blank? ? nil : saved_tag.first
    end

    def self.add_holder saved_tag, new_holder_id
      saved_tag[:holders] = saved_tag[:holders].push(new_holder_id)
      MetaRepos::Tags.modify(saved_tag)
    end

    def self.get_tags_ids holder_id, incoming_tags, source
      incoming_tags.inject([]) do |tags, tag|
        next tags if tag.blank?
        tag = tag.mb_chars.downcase.to_s
        saved_tag = get_saved_tag tag
        if saved_tag
          add_holder(saved_tag, holder_id) unless saved_tag[:holders].include? holder_id
          tags.push(saved_tag[:id])
        else
          new_tag = Tag.new(tag, holder_id, source).to_h
          MetaRepos::Tags.save new_tag
          tags.push(new_tag[:id])
        end
      end 
    end

  end

  class UserUpdatesTags
    def self.run new_holder, old_holder
      old_tags = old_holder[:tags]
      return old_tags if old_tags.blank?
      new_tags = new_holder[:tags] || []
      tags_to_update = old_tags - new_tags
      update_tags(tags_to_update, new_holder[:id])
    end

    def self.update_tags tags, holder_id
      tags.each do |tag_id|
        saved_tag = MetaRepos::Tags.get(id: tag_id).first
        remaining_holders = saved_tag[:holders] - [holder_id]
        if remaining_holders.empty?
          MetaRepos::Tags.delete saved_tag[:id]
        else
          saved_tag[:holders] = remaining_holders
          MetaRepos::Tags.modify saved_tag
        end
      end unless tags.blank?
    end

  end

  class UserGetsTextTags 
    def self.of element
      return nil if element[:tags].blank?
      element[:tags].map{|tag_id| MetaRepos::Tags.get(id: tag_id).first[:text]}
    end
  end

end
