module Pard
  module Test
    module DbTools

      def mongo_uri
        ENV['MONGOLAB_URI']
      end

      # def prepare_db
      #   @db = Mongo::Client.new(mongo_uri)
      #   Repos::Users.for @db
      #   MetaRepos.for @db
      #   ReposFactory.new(@db).build
      # end

      def empty_collections
        connection = Mongo::Client.new(mongo_uri)
        connection.collections.each{ |c|
          c.delete_many
        }
        connection.close
      end

      def drop_database
        connection = Mongo::Client.new(mongo_uri)
        connection.database.drop
        connection.close
      end
    end
  end
end

