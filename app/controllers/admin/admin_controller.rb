# frozen_string_literal: true

module Admin
  class AdminController < ApplicationController
    before_action :check_admin!

    def index
      success({ message: 'Admin dashboard' })
    end

    private

    def check_admin!
      raise Pard::Invalid::Admin unless admin?
    end

    def admin?
      return false unless session[:identity]
      # MetaRepos::Admins stores admins by email in the 'email' field
      # Query by email to check if user is admin
      admins = MetaRepos::Admins.get(email: session[:identity])
      admins.present? && admins.any?
    end
  end
end
