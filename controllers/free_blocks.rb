class FreeBlocksController < BaseController


  post '/users/create_free_block' do
    scopify :profile_id
    check_profile_ownership! profile_id
    free_block = Actions::UserCreatesFreeBlock.run session[:identity], params
    success({free_block: free_block})
  end

  post '/users/modify_free_block' do
    scopify :id
    owner_id = check_free_block_ownership! id
    free_block = Actions::UserModifiesFreeBlock.run owner_id, params
    success({free_block: free_block})
  end

  post '/users/delete_free_block' do
    scopify :id
    check_free_block_ownership! id
    Actions::UserDeletesFreeBlock.run id
    success
  end

  private
  def check_free_block_ownership! free_block_id
    raise Pard::Invalid.new 'non_existing_free_block' unless Repos::FreeBlocks.exists? free_block_id
    owner_id = Repos::FreeBlocks.get_owner(free_block_id)
    raise Pard::Invalid.new 'free_block_ownership' unless (owner_id == session[:identity] || admin?)
    owner_id
  end
end
