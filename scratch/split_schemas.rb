require 'yaml'
require 'fileutils'

def split_schemas(input_file, output_dir)
  content = YAML.load_file(input_file)
  schemas = content.dig('components', 'schemas')
  return unless schemas

  FileUtils.mkdir_p("#{output_dir}/request")
  FileUtils.mkdir_p("#{output_dir}/response")
  FileUtils.mkdir_p("#{output_dir}/other")

  schemas.each do |name, definition|
    # Determine category
    category = if name.end_with?('Request', 'Upsert')
                 'request'
               elsif name.end_with?('Response', 'List')
                 'response'
               else
                 'other'
               end

    # Handle internal $ref by pointing them to the local files if they are in the same directory, 
    # but RSwag/Swagger usually prefers root-relative refs like #/components/schemas/Name.
    # The skill expects us to use snake_case for the schema key, which maps to the filename.
    
    file_name = name.gsub(/([a-z\d])([A-Z])/, '\1_\2').downcase
    path = "#{output_dir}/#{category}/#{file_name}.yaml"
    
    File.write(path, definition.to_yaml)
    puts "Wrote #{path}"
  end
end

split_schemas('openapi/openapi.yaml', 'docs/openapi/v1/schemas')
