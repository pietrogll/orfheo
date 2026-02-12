# frozen_string_literal: true

module Search
  class SearchController < ApplicationController
    # HOTFIX: Force load services since we can't restart the server.
    # This ensures Services module is defined for Actions::Search::LoadResults.
    # This can be removed after server restart (config/initializers/load_sinatra_config.rb handles it).
    load Rails.root.join('services', 'services_index.rb')

    # HOTFIX: Initialize Repos if they are missing.
    # This ensures Repos::* constants are defined for legacy code.
    # This can be removed after server restart.
    unless defined?(Repos::Profiles)
      require_relative '../../../repos/repos_index'
      # Use existing db connection or create one
      db = Mongo::Client.new(ENV['MONGOLAB_URI'] || ['127.0.0.1:27017'], retry_writes: false, database: 'orfheo')
      ReposFactory.new(db).build
      MetaRepos.for db
    end

    # Public endpoints - no authentication required for browsing search pages

    # GET /search/proposals
    def proposals
      status = status_for(current_user_id)
      render 'react_index', locals: { status: status.to_json }
    end

    # GET /search/spaces
    def spaces
      status = status_for(current_user_id)
      render 'react_index', locals: { status: status.to_json }
    end

    # GET /search/profiles
    def profiles
      status = status_for(current_user_id)
      render 'react_index', locals: { status: status.to_json }
    end

    # GET /search/events
    def events
      status = status_for(current_user_id)
      render 'react_index', locals: { status: status.to_json }
    end

    # POST /search/load_results
    def load_results
      results, updated_pull_params = Actions::Search::LoadResults.run(
        params[:pull_params].to_unsafe_h,
        params[:db_key],
        params[:query]
      )
      render json: {
        status: 'success',
        params[:db_key] => results,
        pull_params: updated_pull_params
      }
    end

    # GET /search/public_info?id=:id&db_key=:db_key
    def public_info
      db_element = Actions::GetPublicInfo.run(params[:db_key], params[:id])
      render json: { status: 'success', db_element: db_element }
    end

    private

    def status_for(session_identity)
      return :outsider if session_identity.blank?

      :visitor
    end
  end
end
