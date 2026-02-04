# frozen_string_literal: true

module Admin
  module MetaResourceController
    extend ActiveSupport::Concern

    included do
      # Override these in the including controller
      class_attribute :meta_repo
      class_attribute :resource_name
      class_attribute :resource_name_plural
      class_attribute :permitted_attributes
    end

    def index
      resources = meta_repo.all
      success({ resource_name_plural.to_sym => resources })
    end

    def create
      resource_data = resource_params.merge(_id: SecureRandom.uuid, id: SecureRandom.uuid)
      meta_repo.save(resource_data)
      success({ resource_name.to_sym => resource_data })
    end

    def update
      resource_data = resource_params
      resource_data[:id] = params[:id]
      meta_repo.modify(resource_data)
      resource = meta_repo.get(id: params[:id]).first
      success({ resource_name.to_sym => resource })
    end

    def destroy
      meta_repo.delete(params[:id])
      success({ message: "#{resource_name.capitalize} deleted" })
    end

    private

    def resource_params
      params.permit(*permitted_attributes).to_h.symbolize_keys
    end

    class_methods do
      def meta_resource(repo:, singular:, plural:, attributes:)
        self.meta_repo = repo
        self.resource_name = singular
        self.resource_name_plural = plural
        self.permitted_attributes = attributes
      end
    end
  end
end
