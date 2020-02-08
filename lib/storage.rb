module ApiStorage
  class << self

    def repos db_key #same methods: save, modify, delete, get_by_id, get_owner, exists?
      repos_hash = hash_for_building_repo.merge({
        admins: 'Admins',
        ambients: 'Ambients',
        assets: 'Assets',
        galleries: 'Galleries',
        participants: 'Participants',
        tags: 'Tags'
      })
    
      Repos.const_get(repos_hash[db_key.to_sym])

    end

    def hash_for_building_repo
      {
        activities: 'Activities',
        artistproposals: 'Artistproposals',
        calls: 'Calls',
        events: 'Events',
        forms: 'Forms',
        free_blocks: 'FreeBlocks',
        productions: 'Productions',
        profiles: 'Profiles',
        programs: 'Programs',
        spaceproposals: 'Spaceproposals',
        spaces: 'Spaces',
        users: 'Users'
      }
    end

    def lib
      [
        'arts',
        'audiovisual',
        'craftwork',
        'gastronomy',
        'health',
        'literature',
        'music',
        'other',
        'street_art',
        'visual'
      ]
    end

    def production_categories
      [
        'arts',
        'audiovisual',
        'craftwork',
        'gastronomy',
        'health',
        'literature',
        'music',
        'other',
        'street_art',
        'visual'
      ]
    end

    
  end
end
