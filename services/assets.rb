module Services

  class Assets
  	def self.create params, holder_id
      pictures = get_photos params
      return nil if pictures.blank?
      pictures.each do |picture|
        asset = get_asset picture
        next add_holder(asset, holder_id) unless asset.nil? 
        asset = Asset.new picture, holder_id
        MetaRepos::Assets.save asset.to_h
      end
    end

    def self.update unused_pictures, holder_id
      unused_pictures.select do |unused_picture|
        asset = MetaRepos::Assets.get(url: unused_picture).first
        unless asset.blank?
          asset[:holders] = asset[:holders] - [holder_id]
          asset[:holders].empty? ? MetaRepos::Assets.delete(asset[:id]) : MetaRepos::Assets.modify(asset)
        end
        asset.blank? || asset[:holders].empty?
      end
    end

    private

    def self.get_asset url
      asset = MetaRepos::Assets.get(url: url)
      asset.blank? ? nil : asset.first
    end

    def self.get_photos params
      Services::Gallery.get_photos_array params
    end

    def self.add_holder asset, new_holder_id
      asset[:holders] = asset[:holders].push(new_holder_id) unless asset[:holders].include? new_holder_id
      MetaRepos::Assets.modify(asset)
    end
    
  end


end
