module ExtraReposMethods
  module FreeBlocks

      def get_profile_free_block profile_id
        get({profile_id: profile_id}).first
      end

    end
  end
