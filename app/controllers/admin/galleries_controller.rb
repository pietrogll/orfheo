# frozen_string_literal: true

module Admin
  class GalleriesController < AdminController
    include Admin::MetaResourceController

    meta_resource(
      repo: MetaRepos::Galleries,
      singular: 'gallery',
      plural: 'galleries',
      attributes: %i[source name links photos profile_id user_id]
    )
  end
end
