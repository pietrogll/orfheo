# frozen_string_literal: true

module Admin
  class AssetsController < AdminController
    include Admin::MetaResourceController

    meta_resource(
      repo: MetaRepos::Assets,
      singular: 'asset',
      plural: 'assets',
      attributes: %i[url holders]
    )
  end
end
