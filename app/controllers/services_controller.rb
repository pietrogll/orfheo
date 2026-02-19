# frozen_string_literal: true

class ServicesController < ApplicationController
  # GET /services
  def index
    @status = status_for(nil) # General services page doesn't have an owner
    @page_params = {
      title: 'orfheo | services',
      description: 'Find out more about our cultural services and tools.',
      og_url: 'https://www.orfheo.org/services',
      theme_color: '#ffffff'
    }.to_json
  end
end
