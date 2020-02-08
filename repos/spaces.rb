module ExtraReposMethods
  module Spaces

      def collation_default
        {
          collation: {
            locale: "en",
            strength: 1,
            alternate: "shifted"
          }
        }
      end

      def count query={}, options=nil
        options ||= collation_default
        collection.count(query, options)
      end

      def collect pipeline, options=nil
        options ||= collation_default
        results = collection.aggregate(pipeline, options)
        return [] unless results.count > 0
        Util.symbolize_array results 
      end
      
      def get_profile_space profile_id
        get({profile_id: profile_id})
      end

      def get_all_profile_spaces profile_id
        results = collection.find({profile_id: profile_id})
        return {} unless results.count > 0
        Util.symbolize_array(results)
      end

    end
  end
