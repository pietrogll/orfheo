module Actions

  class UserCreatesFreeBlock
    def self.run user_id, params
      free_block = FreeBlock.new(user_id, params).to_h
      Repos::FreeBlocks.save free_block
      free_block[:gallery] = [Actions::UserCreatesGallery.run(free_block, 'FreeBlocks')]
      free_block
    end
  end

  class UserModifiesFreeBlock
    def self.run user_id, params
      free_block = FreeBlock.new(user_id, params).to_h
      # Services::Gallery.delete_free_block_pictures params[:id], free_block
      Repos::FreeBlocks.modify free_block
      free_block[:gallery] = [Actions::UserUpdatesGallery.run(free_block, 'FreeBlocks')]
      free_block
    end
  end

  class UserDeletesFreeBlock
    def self.run free_block_id
      Actions::UserDeletesGallery.run free_block_id
      Repos::FreeBlocks.delete free_block_id
    end
  end
end
