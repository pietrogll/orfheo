module MetaRepo
  module Base
    def save object
      collection.insert_one object.to_h
    end

    def find query
      collection.find(query).map { |doc|
        mapped_class.from_hash doc
      }
    end

    def get query
      find(query).map(&:to_h)
    end

    def delete id
      collection.delete_one(id: id).map { |doc|
        mapped_class.from_hash doc
      }
    end

    def all
      self.find({}).map(&:to_h)
    end

    def count
      collection.count
    end

    def clear
      collection.drop
    end

    def modify object   # It does NOT add new field / It substitutes values of already existing fields that are only the ones specified in meta_repos.rb
      collection.update_one({id: object[:id]},{
        "$set": object.to_h
      })
    end

    def exists? id
      return false unless UUID.validate(id)
      collection.count(id: id) > 0
    end

    def get_owner id
      object = get(id: id).first
      object[:user_id]
    end

    def get_by_id id
      get(id: id).first
    end 

    def meth name, &block
      self.define_singleton_method name, &block
    end
  end

  def self.for mapped_class, collection, &block
    Class.new do |created_class|
      created_class.extend MetaRepo::Base

      created_class.define_singleton_method :collection do
        collection
      end

      created_class.define_singleton_method :mapped_class do
        mapped_class
      end

      created_class.class_eval(&block) if block_given?
    end
  end
end




# class X; def initialize xx; @xx=xx; end; def to_h; {xx: @xx}; end; end
# Mongo::Logger.level = Logger::FATAL
# c = Mongo::Client.new('mongodb://localhost:27017/cg_dev')

# @m = Repos::MetaRepo.for X, c[:x] do |w|
#   w.meth :boom do |j|
#     ap :boom
#     self.find({})
#   end
# end

# class M < Repos::MetaRepo.for(X, c[:x])
#   meth :aa do |x|
#     ap :aaaaa
#   end
# end

# ap M.methods - M.class.new.methods



# ap @m.methods - @m.class.new.methods
# ap @m.class.methods - @m.class.class.new.methods

# x = X.new w: 9, j: 10
# ap @m.boom 10
# ap @m.find j: 10
# # @m.boom
# # ap @m.methods

# @m.save x
# ap @m.all

