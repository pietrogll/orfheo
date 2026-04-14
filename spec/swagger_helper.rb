# frozen_string_literal: true

require 'rails_helper'

RSpec.configure do |config|
  # Specify a root folder where Swagger JSON files are generated
  config.openapi_root = Rails.root.join('openapi').to_s

  config.openapi_all_properties_required = false
  config.openapi_no_additional_properties = true

  # load components from openapi/schemas
  def generate_components(patterns)
    components = { schemas: {}, examples: {} }
    patterns.each do |type, pattern|
      Dir.glob(Rails.root.join(pattern).to_s).each do |schema_file|
        # The key name is derived from the YAML filename (snake_case)
        key = File.basename(schema_file, '.yaml')
        components[type][key] = transform_yaml_to_json(schema_file)
      end
    end
    components
  end

  def transform_yaml_to_json(schema_file)
    Psych.safe_load(
      ERB.new(File.read(schema_file)).result,
      permitted_classes: [Symbol],
      symbolize_names: true
    )
  end

  # Initial load of components for the config
  components = generate_components({ schemas: 'openapi/schemas/**/*.yaml' })

  config.openapi_specs = {
    'openapi.yaml' => {
      openapi: '3.0.1',
      info: {
        title: 'Orfheo API',
        version: '1.0.0'
      },
      paths: {},
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local'
        }
      ],
      components: {
        securitySchemes: {
          cookieAuth: {
            type: :apiKey,
            in: :cookie,
            name: 'rack.session'
          }
        },
        schemas: components[:schemas]
      }
    }
  }

  config.openapi_format = :yaml
end
