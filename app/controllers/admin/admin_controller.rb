# frozen_string_literal: true

module Admin
  class AdminController < ApplicationController
    before_action :check_admin!

    def index
      respond_to do |format|
        format.html
        format.json { success({ message: 'Admin dashboard' }) }
      end
    end
  end
end
