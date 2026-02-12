# frozen_string_literal: true

module Admin
  class TagsController < AdminController
    include Admin::MetaResourceController

    meta_resource(
      repo: MetaRepos::Tags,
      singular: 'tag',
      plural: 'tags',
      attributes: %i[text source holders]
    )
  end
end
