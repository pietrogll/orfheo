# frozen_string_literal: true

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
        connection = Mongo::Client.new(mongo_uri, retry_writes: false)
        connection.collections.each(&:delete_many)
        connection.close
      end

      def drop_database
        connection = Mongo::Client.new(mongo_uri, retry_writes: false)
        connection.database.drop
        connection.close
      end
    end
  end
end
