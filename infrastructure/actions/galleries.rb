module Actions

  class UserCreatesGallery
  	def self.run params, source
      gallery = Gallery.new(params, source).to_h
      MetaRepos::Galleries.save gallery unless gallery.blank?
      Services::Assets.create gallery, gallery[:id]
      gallery
    end
  end

  class UserUpdatesGallery
  	def self.run params, source
  	  gallery = Gallery.new(params, source).to_h
      Services::Gallery.update_pictures(params[:id], gallery)
      MetaRepos::Galleries.delete(params[:id]) 
      MetaRepos::Galleries.save(gallery) unless gallery.blank?
      gallery
    end
  end

  class UserDeletesGallery
  	def self.run gallery_id
      Services::Gallery.update_pictures gallery_id
      MetaRepos::Galleries.delete gallery_id
    end
  end

end
