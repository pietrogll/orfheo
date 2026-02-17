# frozen_string_literal: true

module ExtraReposMethods
  module Spaces
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

    def collect(pipeline, options = nil)
      options ||= collation_default
      results = collection.aggregate(pipeline, options)
      return [] unless results.count.positive?

      Util.symbolize_array(results).map do |doc|
        doc.is_a?(Hash) ? doc.reject { |key, _| key == :_id } : doc
      end
    end

    def get_profile_space(profile_id)
      get({ profile_id: profile_id })
    end

    def get_all_profile_spaces(profile_id)
      results = collection.find({ profile_id: profile_id })
      return {} unless results.count.positive?

      Util.symbolize_array(results).map do |doc|
        doc.is_a?(Hash) ? doc.reject { |key, _| key == :_id } : doc
      end
    end
  end
end
