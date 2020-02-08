module Pard

  class Unexisting < StandardError
  end

  class Unexisting::Slug < Unexisting
  end


  class Invalid < StandardError
  end

  class Invalid::UnexistingDbEl < Invalid 
    def message
      'not_existing_element'
    end
  end

  class Invalid::ExistingUser < Invalid
    def message
      'already_registered'
    end
  end

  class Invalid::UnexistingUser < Invalid
    def message
      'non_existing_user'
    end
  end

  class Invalid::Params < Invalid
    def message
      'invalid_parameters'
    end
  end

  class Invalid::Blocks < Invalid
    def message
      'invalid_blocks'
    end
  end

  class Invalid::FormsTexts < Invalid
    def message
      'invalid_forms_texts'
    end
  end

  class Invalid::Password < Invalid
    def message
      'incorrect_password'
    end
  end

  class Invalid::Unvalidated < Invalid
    def message
      'not_validated_user'
    end
  end

  class Invalid::Type < Invalid
    def message
      'invalid_type'
    end
  end

  class Invalid::Category < Invalid
    def message
      'invalid_category'
    end
  end

  class Invalid::Form < Invalid
    def message
      'invalid_form'
    end
  end

  class Invalid::ExistingProfile < Invalid
    def message
      'existing_profile'
    end
  end

  class Invalid::UnexistingProfile < Invalid
    def message
      'non_existing_profile'
    end
  end


  class Invalid::ExistingName < Invalid
    def message
      'existing_name'
    end
  end

  class Invalid::UnexistingProduction < Invalid
    def message
      'non_existing_production'
    end
  end

  class Invalid::UnexistingProposal < Invalid
    def message
      'non_existing_proposal'
    end
  end

  class Invalid::UnexistingEvent < Invalid
    def message
      'non_existing_event'
    end
  end

  class Invalid::UnexistingParticipants < Invalid
    def message
      'non_existing_participants'
    end
  end

  class Invalid::UnexistingActivity < Invalid
    def message
      'non_existing_activity'
    end
  end

  class Invalid::Ownership < Invalid
    def message
      'you_dont_have_permission'
    end
  end


  class Invalid::ProfileOwnership < Invalid
    def message
      'you_dont_have_permission'
    end
  end

  class Invalid::ProductionOwnership < Invalid
    def message
      'you_dont_have_permission'
    end
  end

  class Invalid::ProposalOwnership < Invalid
    def message
      'you_dont_have_permission'
    end
  end

  class Invalid::CallOwnership < Invalid
    def message
      'you_dont_have_permission'
    end
  end

  class Invalid::EventOwnership < Invalid
    def message
      'you_dont_have_permission'
    end
  end

  class Invalid::ExistingCall < Invalid
    def message
      'existing_call'
    end
  end

  class Invalid::UnexistingCall < Invalid
    def message
      'non_existing_call'
    end
  end

  class Invalid::UnexistingForm < Invalid
    def message
      'non_existing_form'
    end
  end

  class Invalid::QueryParams < Invalid
    def message
      'invalid_query'
    end
  end

  class Invalid::FilterParams < Invalid
    def message
      'invalid_filters'
    end
  end

  class Invalid::Deadline < Invalid
    def message
      'out_of_time_range'
    end
  end

  class Invalid::Language < Invalid
    def message
      'invalid_language'
    end
  end

  class Invalid::Admin < Invalid
    def message
      'invalid_admin'
    end
  end

  class Invalid::ProgrammedSpace < Invalid
    def message
      'space_has_activities'
    end
  end

  class Invalid::EmptyCall < Invalid
    def message
      'call_has_participants'
    end
  end

  class Invalid::EmptyProposals < Invalid
    def message
      'form_has_proposals'
    end
  end

  class Invalid::EmptyProgram < Invalid
    def message
      'program_has_activities'
    end
  end

  class Invalid::FutureEvent < Invalid
    def message
      'past_event'
    end
  end

  class Invalid::DateTime < Invalid
    def message
      'invalid_dateTime'
    end
  end

end


