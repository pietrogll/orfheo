module Repos
end

class ReposFactory

	def initialize db
		@@db = db
	end

	def build hash_repo_class = ApiStorage.hash_for_building_repo
		hash_repo_class.each do |k, v|
			create_repo k, v
		end
	end

  def create_repo db_key, class_name
    klass = create_repo_klass class_name
    klass.class_variable_set :@@collection, @@db[db_key.to_s]
    klass.class_eval do 
      extend BaseReposMethods
      extend ExtraReposMethods.const_get(class_name) if ExtraReposMethods.const_defined? class_name
    end
  end

  private

  def create_repo_klass class_name 
    return existing_repo_klass(class_name) if repo_klass_exists?(class_name) 
    klass = Class.new
    Repos.const_set(class_name, klass)
    klass
  end

  def existing_repo_klass class_name
    Repos.const_get class_name.to_sym
  end

  def repo_klass_exists? class_name
    Repos.const_defined?(class_name.to_sym)
  end

end



module BaseReposMethods
		
	def save object 
		collection.insert_one object.to_h
	end
	
	def modify object
    collection.update_one({id: object[:id]},{
      "$set": object.to_h
    })
  end

  def get query
    grab query
  end

  def delete id
    collection.delete_one(id: id)
  end

  def exists? id
    return false unless UUID.validate(id)
    collection.count(id: id) > 0
  end

  def all
    grab({})
  end

  def get_by_id id
    grab({id: id}).first
  end

  def delete_many query
    collection.delete_many(query)
  end

  def get_owner form_id
    get_by_id(form_id)[:user_id]
  end

  def clear
    collection.drop
  end

  private

  def collection 
		self.class_variable_get(:@@collection)
	end

  def grab query
    results = collection.find(query)
    return [] unless results.count > 0
    Util.symbolize_array results
  end   
	
end
