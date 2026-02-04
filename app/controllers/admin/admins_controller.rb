# frozen_string_literal: true

module Admin
  class AdminsController < AdminController
    def index
      admins = MetaRepos::Admins.all
      success({ admins: admins })
    end

    def create
      # Create admin by user email/ID
      admin_data = admin_params
      admin_data[:id] = SecureRandom.uuid unless admin_data[:id]
      MetaRepos::Admins.save(admin_data)
      success({ admin: admin_data })
    end

    def destroy
      MetaRepos::Admins.delete(params[:id])
      success({ message: 'Admin deleted' })
    end

    private

    def admin_params
      params.permit(:email, :_id, :id).to_h.symbolize_keys
    end
  end
end
