module Actions

  class UserGetsEventProfileProposals
    def self.run event_id, profile_id
      Repos::Spaceproposals.get({'$and':[{profile_id: profile_id}, {event_id: event_id}]}) + Repos::Artistproposals.get({'$and':[{profile_id: profile_id}, {event_id: event_id}]})
    end
  end

  class UserGetsArtistsList 
    class << self
    
    def run proposal, artists_list = []      
     
      proposal[:proposal_id] = proposal[:id]
      profile_id = proposal[:profile_id]
      profile_id += '-own' if proposal[:own].is_true?
      artist = artists_list.find{|artist| artist[:profile_id] == profile_id}
      if artist.nil?
        profile = proposal[:own].is_true? ? MetaRepos::Participants.get_by_id(proposal[:profile_id]) : Repos::Profiles.get_by_id(proposal[:profile_id])
        artist = new_artist profile
        artist[:profile_id] = profile_id
        artist[:own] = true if proposal[:own].is_true?
        artists_list += [artist]
      end
      if (artist[:phone].blank? || artist[:phone][:value].blank?) 
        artist[:phone] = proposal[:phone]
      else 
        proposal[:phone] = artist[:phone]
      end
      artist[:proposals] += [proposal.except(:profile_id, :event_id, :call_id, :id, :user_id)]
      artists_list
    end

    def new_artist profile
      {
        profile_id: profile[:id],
        email: profile[:email][:value],
        name: profile[:name],
        address: profile[:address],
        phone: profile[:phone],
        color: profile[:color],
        proposals: []
      }
    end

    end
  end


  class UserGetsSpace 
    class << self
    
    def run proposal
      profile = proposal[:own].is_true? ? MetaRepos::Participants.get_by_id(proposal[:profile_id]) : Repos::Profiles.get_by_id(proposal[:profile_id])
      space = new_space profile
      space[:phone] = proposal[:phone] if space[:phone].blank? || space[:phone][:value].blank?
      proposal[:proposal_id] = proposal[:id]
      proposal[:profile_id]+= "-own" if proposal[:own].is_true?
      space.merge(proposal.except(:phone, :event_id, :call_id, :user_id, :id))
    end

    def new_space profile
      {
        email: profile[:email][:value],
        name: profile[:name],
        color: profile[:color],
        phone: profile[:phone]
      }
    end

    end
  end
  
  class UserCreatesArtistProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_artistproposal owner_id, user_id, params
      proposal = proposalManager.create
      add_participant_to_event(params[:call_id], proposal[:profile_id])
      proposal
    end

    def self.add_participant_to_event call_id, participant_id
      Repos::Calls.add_participant(call_id, participant_id)
    end
    
  end

  class UserAmendsArtistProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_artistproposal owner_id, user_id, params
      proposalManager.amend
    end
  end

  class UserModifiesArtistProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_artistproposal owner_id, user_id, params
      proposal = proposalManager.modify
      reset_activities proposal[:id]
      proposal
    end

    def self.reset_activities proposal_id
      Repos::Activities.reset(proposal_id)
    end

  end

  class UserSelectsArtistProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_artistproposal owner_id, user_id, params
      proposal = proposalManager.select_deselect
      proposal[:profile_id] += '-own' if proposal[:own].is_true?
      proposal[:profile_id]
    end

  end

  class UserDeletesArtistProposal

    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_artistproposal owner_id, user_id, params
      proposal = proposalManager.delete
      profile_id = proposal[:own].is_true? ? (proposal[:profile_id] + '-own') : proposal[:profile_id]
      profile_id
    end    

    def self.remove_pictures proposal
      Services::Gallery.delete_pictures(proposal[:photos], proposal[:id]) if proposal[:photos]
      proposalPhotos = Services::Gallery.get_photos_from_form proposal
      Services::Gallery.compare_and_delete_unused_pictures nil, {photos: proposalPhotos} unless proposalPhotos.blank?
    end

  end



  class UserCreatesSpaceProposal

    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_spaceproposal(owner_id, user_id, params)
      proposal = proposalManager.create
      add_participant_to_event(params[:call_id], proposal[:profile_id])
      add_space_to_program(proposal[:event_id], proposal[:id])
      proposal   
    end

    def self.add_participant_to_event call_id, participant_id
      Repos::Calls.add_participant(call_id, participant_id)
    end

    def self.add_space_to_program event_id, proposal_id
      Repos::Programs.add_space(event_id, proposal_id)   
    end

  end

  class UserAmendsSpaceProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_spaceproposal(owner_id, user_id, params)
      proposalManager.amend
    end
  end
 
  class UserModifiesSpaceProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_spaceproposal(owner_id, user_id, params)
      proposal = proposalManager.modify
    end
  end

  class UserSelectsSpaceProposal
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_spaceproposal(owner_id, user_id, params)
      proposal = proposalManager.select_deselect
      program = Repos::Programs.get({event_id: proposal[:event_id]}).first
      new_order = proposal[:selected].is_true? ? (program[:order] - [proposal[:id]]) : (program[:order].push(proposal[:id]))
      Actions::UserOrdersSpaces.run program[:id], new_order, proposal[:event_id]
    end
  end

  class UserDeletesSpaceProposal
    
    def self.run owner_id, user_id, params
      proposalManager = ProposalManager.for_spaceproposal(owner_id, user_id, params)
      proposal = proposalManager.delete
      proposal_profile_id = proposal[:profile_id]
    end

    def self.remove_pictures proposal
      Actions::DeleteProposalsPictures.run [], [proposal]
    end

  end


  class DeleteProposalsPictures

    def self.run artist_proposals = [], space_proposals = []
      artists_pictures_to_delete = get_artist_pictures_to_delete_from artist_proposals
      spaces_pictures_to_delete = get_space_pictures_to_delete_from space_proposals
      pictures_to_delete = artists_pictures_to_delete + spaces_pictures_to_delete
      Services::Gallery.permanently_delete_unused(pictures_to_delete) unless pictures_to_delete.blank?
    end

    def self.get_artist_pictures_to_delete_from artist_proposals
      artist_proposals.inject([]) do |pictures_to_delete_arr, proposal|
        unused_pictures = get_artist_proposal_pictures(proposal)
        pictures_to_delete_arr += Services::Assets.update(unused_pictures, proposal[:id])
      end
    end


    def self.get_space_pictures_to_delete_from space_proposals
      space_proposals.inject([]) do |pictures_to_delete_arr, proposal|
        unused_pictures = get_space_proposal_pictures(proposal)
        pictures_to_delete_arr += Services::Assets.update(unused_pictures, proposal[:id])
      end
    end

    def self.get_artist_proposal_pictures proposal
      Services::Gallery.get_photos_array(proposal) + Services::Gallery.get_photos_from_form(proposal)
    end

    def self.get_space_proposal_pictures proposal
      Services::Gallery.get_space_proposal_picures(proposal) + Services::Gallery.get_photos_from_form(proposal) 
    end

  end

end
