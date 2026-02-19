# frozen_string_literal: true

class WelcomeController < ApplicationController
  # Welcome page - serves the main landing page
  def index
    if logged_in?
      redirect_to users_path
      return
    end

    @status = status_for(nil)
    @page_params = {
      title: 'orfheo | your cultural community',
      description: 'Muestra y descubre proyectos, lanza tus convocatorias, participa en grandes eventos. Crea en red: tu comunidad cultural te llama.',
      og_url: 'https://www.orfheo.org',
      theme_color: '#ffffff'
    }.to_json
  end
end
