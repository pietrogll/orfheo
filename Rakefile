require 'bundler'

Bundler.require(:default, :test)

require 'sinatra/asset_pipeline/task'
require './config/config'


Sinatra::Sprockets::Manifest = Sprockets::Manifest
Sinatra::AssetPipeline::Task.define! BaseController


namespace :test do
  begin
    require "rspec/core/rake_task"
    desc "Run all examples"
    RSpec::Core::RakeTask.new(:spec) do |t|
      t.rspec_opts = %w[--color]
      t.pattern = 'spec/**/*_spec.rb'
    end
  rescue LoadError
  end
end

namespace :db do
  desc 'drop collections'
  task :drop do
    begin
      print 'dropping collections :'
      Mongo::Connection.new['cg_dev'].collections.each do |c|
        c.drop
        print ' .'
      end
      puts ' done ;)'
    rescue StandardError => e
      p e
    end
  end
  desc 'drop actions collection'
  task :drop_actions do
    begin
      Mongo::Connection.new['cg_dev']['actions'].drop
      puts 'actions cleared'
    rescue StandardError => e
      p e
    end
  end
end

desc "Run all test suites"
task :test => ["test:spec"]

task :actions => ['db:drop_actions']

task :default => [:test]

