# frozen_string_literal: true

require 'json'

class MyExceptionHandling
  def initialize(app)
    @app = app
  end

  def call(env)
    @app.call env
  rescue Pard::Unexisting::Slug
    [302, { 'Location' => '/' }, ['Welcome']]
  rescue Pard::Unexisting => e
    # Re-raise for request specs that expect literal raise_error/handle via rescue_from
    raise e if (ENV['RAILS_ENV'] == 'test' || ENV['RACK_ENV'] == 'test')
    [404, { 'Content-Type' => 'text/plain' }, ['Not Found']]
  rescue Pard::Invalid::Unauthorized => e
    raise e if (ENV['RAILS_ENV'] == 'test' || ENV['RACK_ENV'] == 'test')
    json_fail(e, env)
  rescue Pard::Invalid => e
    raise e if (ENV['RAILS_ENV'] == 'test' || ENV['RACK_ENV'] == 'test')
    json_fail(e, env)
  end

  private

  def json_fail(e, env)
    hash = {
      status: 'fail',
      reason: e.message
    }
    hash[:backtrace] = e.backtrace if %w[development test].include?(ENV['RACK_ENV'] || ENV['RAILS_ENV'])
    [200, { 'Content-Type' => 'application/json' }, [hash.to_json]]
  end
end
