require 'securerandom'
require 'json'

module MetaController
  module Base
    def self.extended base
      base.class_eval do
        post settings.prefix + '/', provides: :json do
          scopify :profile_id 
          check_profile_ownership! profile_id

          object_to_save = settings.repo.mapped_class.from_hash params  #generates an instance of the metarepo (?) 
          object_to_save.id = SecureRandom.uuid unless object_to_save.id

          settings.repo.save object_to_save
          success({saved: object_to_save.to_h})
          # {
          #   status: :ok,
          #   saved: object_to_save.to_h
          # }.to_json
        end

        post settings.prefix + '/modify', provides: :json do

          scopify :id
          check_ownership id

          object_to_save = settings.repo.mapped_class.from_hash params

          settings.repo.modify object_to_save
          success({saved: object_to_save.to_h})
          # {
          #   status: :ok,
          #   saved: object_to_save.to_h
          # }.to_json
        end


        get settings.prefix  + '/', provides: :json do
          success({list: settings.repo.all})
          # {
          #   status: :ok,
          #   list: settings.repo.all
          # }.to_json
        end

        settings.repo.mapped_class.members.each do |attr_name|
          self.send :get, "#{settings.prefix}/by_#{attr_name}/:value", provides: :json do |value|
            success({list: settings.repo.find(attr_name => value)})
            # {
            #   status: :ok,
            #   list: settings.repo.find(attr_name => value)
            # }.to_json
          end
        end

        delete settings.prefix + '/:id', provides: :json do |id|
          settings.repo.delete id
          success
          # {
          #   status: :ok
          # }.to_json
        end


        private
    
        def check_ownership id
          raise Pard::Invalid.new 'non_existing_object' unless settings.repo.exists? id
          raise Pard::Invalid.new 'not_owner' unless settings.repo.get_owner(id) == session[:identity]
        end

      end
    end



  end


  def self.for repo
    Class.new(::BaseController) do |created_class|
      created_class.set :prefix, '/' + repo.route
      created_class.set :repo, repo
      created_class.extend MetaController::Base
      created_class.class_eval &block if block_given?
    end
  end



end
