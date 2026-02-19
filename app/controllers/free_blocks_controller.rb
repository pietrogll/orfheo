# frozen_string_literal: true

class FreeBlocksController < ApplicationController
  skip_before_action :verify_authenticity_token, only: %i[create update destroy]
  before_action :require_login!

  # POST /users/create_free_block
  def create
    check_profile_ownership!(params[:profile_id])
    free_block = Actions::UserCreatesFreeBlock.run(current_user_id, params.to_unsafe_h)
    success(free_block: free_block)
  end

  # POST /users/modify_free_block
  def update
    owner_id = check_free_block_ownership!(params[:id])
    free_block = Actions::UserModifiesFreeBlock.run(owner_id, params.to_unsafe_h)
    success(free_block: free_block)
  end

  # POST /users/delete_free_block
  def destroy
    check_free_block_ownership!(params[:id])
    Actions::UserDeletesFreeBlock.run(params[:id])
    render json: { status: 'success' }
  end

  private

  def check_free_block_ownership!(free_block_id)
    raise Pard::Invalid, 'non_existing_free_block' unless Repos::FreeBlocks.exists?(free_block_id)

    owner_id = Repos::FreeBlocks.get_owner(free_block_id)
    raise Pard::Invalid, 'free_block_ownership' unless owner_id == current_user_id || admin?

    owner_id
  end
end
