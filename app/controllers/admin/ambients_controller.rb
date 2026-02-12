# frozen_string_literal: true

module Admin
  class AmbientsController < AdminController
    include Admin::MetaResourceController

    meta_resource(
      repo: MetaRepos::Ambients,
      singular: 'ambient',
      plural: 'ambients',
      attributes: %i[name description size tech_specs tech_poss floor height capacity
                     allowed_categories allowed_formats links photos space_id user_id]
    )
  end
end
