require 'json'

class MyExceptionHandling
  def initialize(app)
    @app = app
  end

  def call(env)
    begin
      @app.call env
    rescue Pard::Unexisting::Slug
      [302, {'Location' => '/'}, ['Welcome']]
    rescue Pard::Unexisting
      [404, {'Content-Type' => 'text_plain'}, ['Not Found']]
    rescue Pard::Invalid => ex
      env['rack.errors'].puts ex
      env['rack.errors'].puts ex.backtrace.join("\n")
      env['rack.errors'].flush

      hash = {
        :status => :fail,
        :reason => ex.message
      }
      hash[:backtrace] = ex.backtrace if ['development', 'test'].include? ENV['RACK_ENV']

      [200, {'Content-Type' => 'application/json'}, [hash.to_json]]
    end
  end
end
