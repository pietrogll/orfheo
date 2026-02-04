class Search::SearchController < ApplicationController
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
      params[:pull_params],
      params[:db_key],
      params[:query]
    )
    render json: {
      status: 'success',
      data: {
        params[:db_key] => results,
        pull_params: updated_pull_params
      }
    }
  end

  # GET /search/public_info?id=:id&db_key=:db_key
  def public_info
    db_element = Actions::GetPublicInfo.run(params[:db_key], params[:id])
    render json: { status: 'success', data: { db_element: db_element } }
  end

  private

  def status_for(session_identity)
    return :outsider if session_identity.blank?
    :visitor
  end
end
