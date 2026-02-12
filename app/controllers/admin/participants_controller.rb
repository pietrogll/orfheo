# frozen_string_literal: true

module Admin
  class ParticipantsController < AdminController
    include Admin::MetaResourceController

    meta_resource(
      repo: MetaRepos::Participants,
      singular: 'participant',
      plural: 'participants',
      attributes: %i[name email phone address facets color user_id]
    )
  end
end
