require_relative './base'

class StructFromHash

  def self.for *members
    struct = Struct.new *members  #members son los campos que definen el (meta)repo

    struct.define_singleton_method(:from_hash) do |h|
      generated_instance = struct.new
      struct.members.each do |member|
        generated_instance.send "#{member}=", h[member]
      end
      generated_instance
    end

    struct
  end
end


module MetaRepos
  def self.for database   #Only the fields specified here can be part of the saved objects of the collection
    [
     
      [StructFromHash.for(:id, :text, :source, :holders), :tags],
      [StructFromHash.for(:id, :name, :description, :size, :tech_specs, :tech_poss, :floor, :height, :capacity, :allowed_categories, :allowed_formats, :links, :photos, :space_id, :user_id), :ambients],
      [StructFromHash.for(:id, :source, :name, :links, :photos, :profile_id, :user_id), :galleries], # one-to-many relations
      [StructFromHash.for(:id, :email), :admins], 
      [StructFromHash.for(:id, :url, :holders), :assets],

      [StructFromHash.for(:id, :name, :email, :phone, :address, :facets, :color, :user_id), :participants],

      # [StructFromHash.for(:id, :portfolio), :portfolios], # ???      

      # [StructFromHash.for(:id, :facet), :facets] # used has example in spec but not in the web 

    ].each { |klass, collection|
      m = MetaRepo.for klass, database[collection]    #definido en meta_repo/base.rb

      m.define_singleton_method(:route) {
        collection.to_s
      }

      repo_class = collection.capitalize.to_sym
      MetaRepos.const_set(repo_class, m) unless MetaRepos.const_defined? repo_class
    }
  end
end
