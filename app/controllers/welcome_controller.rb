# frozen_string_literal: true

class WelcomeController < ApplicationController
  # Welcome page - serves the main landing page
  def index
    # No authentication required for welcome page
    # Page params can be set by views for meta tags
    @page_params = {
      title: 'orfheo | your cultural community',
      description: 'Muestra y descubre proyectos, lanza tus convocatorias, participa en grandes eventos. Crea en red: tu comunidad cultural te llama.',
      og_url: 'https://www.orfheo.org',
      theme_color: '#ffffff'
    }.to_json
  end
end
