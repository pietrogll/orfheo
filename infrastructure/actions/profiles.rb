module Actions

  class FilterProfile
    def self.run profile
      profile.delete(:phone) if profile.has_key?(:phone) && (profile[:phone].blank? || profile[:phone][:visible].is_false?)
      profile.delete(:email) if  profile.has_key?(:email) && (profile[:email].blank? || profile[:email][:visible].is_false?)
      profile
    end
  end

  class UserGetsProfiles
    def self.run user_id
      profiles = Repos::Profiles.get_user_profiles user_id
      profiles.each { |profile| profile[:tags] = Actions::UserGetsTextTags.of profile } unless profiles.blank?
      profiles
    end
  end

  class VisitProfile
    def self.run profile_id
      profile = Repos::Profiles.get_by_id profile_id
      profile = Actions::FilterProfile.run profile
      Services::Profiles.make_up profile
    end
  end

  class VisitProfileAsOwner
    def self.run profile_id
      profile = Repos::Profiles.get_by_id profile_id
      Services::Profiles.make_up profile
    end
  end

  class UserChecksName
    def self.run user_id, profile_name, profile_id = nil
      is_my_name?(profile_name, profile_id) || Repos::Profiles.name_available?(user_id, profile_name)
    end

    def self.is_my_name? profile_name, profile_id = nil
      return false if (profile_id.blank? || !Repos::Profiles.exists?(profile_id))
      profile = Repos::Profiles.get_by_id profile_id
      profile[:name].gsub(/\s+/, "").downcase == profile_name.gsub(/\s+/, "").downcase
    end
  end

  class UserCreatesProfile

    def self.run user_id, params 
      profile = Profile.new(user_id, params).to_h
      profile[:tags] = Actions::UserCreatesTags.run(profile, 'profiles')
      Repos::Profiles.save profile
      update_relations user_id, profile[:id]     
      profile[:gallery] = [Actions::UserCreatesGallery.run(profile, 'profiles')]
      
      profile
    end

    private

    def self.update_relations user_id, profile_id
      user_profiles = Repos::Profiles.get_user_profiles user_id
      user_profiles.each{ |profile|
        next if profile[:id] == profile_id 
        profile[:relations] = user_profiles.inject([]){ |relations, user_profile| 
          profile[:id] == user_profile[:id] ? relations : relations.push(user_profile.slice(:id, :name, :color))
          }
        Repos::Profiles.modify profile
        } 
    end

    
  
  end

  class UserModifiesProfile
    def self.run user_id, params
     
      profile = Profile.new(user_id, params).to_h
      profile[:tags] = Actions::UserCreatesTags.run(profile, 'profiles')
      Actions::UserUpdatesTags.run(profile, Repos::Profiles.get_by_id(profile[:id]))
      Repos::Profiles.modify profile
      # Repos::Events.update profile
      gallery = Actions::UserUpdatesGallery.run(profile, 'profiles')
      profile[:gallery] = [gallery] unless gallery.blank?
      profile[:tags] = Actions::UserGetsTextTags.of profile
      profile
    end   
  end

  class UserModifiesProfileDescription
    def self.run params
      Repos::Profiles.modify params
    end
  end

  class UserModifiesProfileName
    def self.run user_id, params
      raise Pard::Invalid::ExistingName unless Actions::UserChecksName.run(user_id, params[:name], params[:id])
      Repos::Profiles.modify params
    end
  end

  class UserDeletesProfile

    def self.run profile_id
      delete_productions profile_id
      delete_spaces profile_id
      delete_free_block profile_id
      update_relations profile_id
      delete_gallery profile_id
      delete_tags profile_id
      delete_calls profile_id
      update_participations profile_id
      Repos::Profiles.delete profile_id
    end
    
    def self.delete_productions profile_id
      Repos::Productions.get_profile_productions(profile_id).each{ |production|
        Actions::UserDeletesProduction.run production[:id]
      }
    end

    def self.delete_spaces profile_id
      spaces = Repos::Spaces.get_all_profile_spaces profile_id
      spaces.each{|space| Actions::UserDeletesSpace.run space[:id] unless space.blank?}
    end

    def self.delete_free_block profile_id
      free_blok = Repos::FreeBlocks.get_profile_free_block profile_id
      Actions::UserDeletesFreeBlock.run free_blok[:id] unless free_blok.blank?
    end

    def self.delete_gallery profile_id
      Actions::UserDeletesGallery.run profile_id
    end

    def self.update_relations profile_id
      user_id = Repos::Profiles.get_owner profile_id
      user_profiles = Repos::Profiles.get_user_profiles user_id
      user_profiles.each{ |profile|
        next if profile[:id] == profile_id 
        profile[:relations].delete_if{|el| el[:id] == profile_id}
        Repos::Profiles.modify profile
        } 
    end

    def self.delete_tags profile_id
      Actions::UserUpdatesTags.update_tags(Repos::Profiles.get_by_id(profile_id)[:tags], profile_id)
    end

    def self.delete_calls profile_id
      calls = Repos::Calls.get({profile_id: profile_id})
      calls.each do |call| 
        Actions::UserDeletesCall.run call[:id]
      end
    end

    def self.update_participations profile_id
      Services::Profiles.update_participations profile_id
    end
    
  end
end
