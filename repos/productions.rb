# frozen_string_literal: true

module ExtraReposMethods
  module Productions
    def collation_default
      {
        collation: {
          locale: 'en',
          strength: 1,
          alternate: 'shifted'
        }
      }
    end

    def count(query = {}, options = nil)
      options ||= collation_default
      collection.count(query, options)
    end

    def get_profile_productions(profile_id)
      get({ profile_id: profile_id })
    end

    def collect(pipeline, options = nil)
      options ||= collation_default
      results = collection.aggregate(pipeline, options)
      return [] unless results.count.positive?

      Util.symbolize_array results
    end
  end
end
