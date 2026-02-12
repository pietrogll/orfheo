# frozen_string_literal: true

module Pard
  class Unexisting < StandardError
  end

  class Unexisting
    class Slug < Unexisting
    end
  end

  class Invalid < StandardError
  end

  class Invalid
    class UnexistingDbEl < Invalid
      def message
        'not_existing_element'
      end
    end
  end

  class Invalid
    class ExistingUser < Invalid
      def message
        'already_registered'
      end
    end
  end

  class Invalid
    class UnexistingUser < Invalid
      def message
        'non_existing_user'
      end
    end
  end

  class Invalid
    class Params < Invalid
      def message
        'invalid_parameters'
      end
    end
  end

  class Invalid
    class Blocks < Invalid
      def message
        'invalid_blocks'
      end
    end
  end

  class Invalid
    class FormsTexts < Invalid
      def message
        'invalid_forms_texts'
      end
    end
  end

  class Invalid
    class Password < Invalid
      def message
        'incorrect_password'
      end
    end
  end

  class Invalid
    class Email < Invalid
      def message
        'invalid_email'
      end
    end
  end

  class Invalid
    class Unauthorized < Invalid
      def message
        'unauthorized'
      end
    end
  end

  class Invalid
    class Authentication < Invalid
      def message
        'unauthorized'
      end
    end
  end

  class Invalid
    class Unvalidated < Invalid
      def message
        'not_validated_user'
      end
    end
  end

  class Invalid
    class Type < Invalid
      def message
        'invalid_type'
      end
    end
  end

  class Invalid
    class Category < Invalid
      def message
        'invalid_category'
      end
    end
  end

  class Invalid
    class Form < Invalid
      def message
        'invalid_form'
      end
    end
  end

  class Invalid
    class ExistingProfile < Invalid
      def message
        'existing_profile'
      end
    end
  end

  class Invalid
    class UnexistingProfile < Invalid
      def message
        'non_existing_profile'
      end
    end
  end

  class Invalid
    class ExistingName < Invalid
      def message
        'existing_name'
      end
    end
  end

  class Invalid
    class UnexistingProduction < Invalid
      def message
        'non_existing_production'
      end
    end
  end

  class Invalid
    class UnexistingProposal < Invalid
      def message
        'non_existing_proposal'
      end
    end
  end

  class Invalid
    class UnexistingEvent < Invalid
      def message
        'non_existing_event'
      end
    end
  end

  class Invalid
    class UnexistingParticipants < Invalid
      def message
        'non_existing_participants'
      end
    end
  end

  class Invalid
    class UnexistingActivity < Invalid
      def message
        'non_existing_activity'
      end
    end
  end

  class Invalid
    class Ownership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class ProfileOwnership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class ProductionOwnership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class ProposalOwnership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class CallOwnership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class EventOwnership < Invalid
      def message
        'you_dont_have_permission'
      end
    end
  end

  class Invalid
    class ExistingCall < Invalid
      def message
        'existing_call'
      end
    end
  end

  class Invalid
    class UnexistingCall < Invalid
      def message
        'non_existing_call'
      end
    end
  end

  class Invalid
    class UnexistingForm < Invalid
      def message
        'non_existing_form'
      end
    end
  end

  class Invalid
    class QueryParams < Invalid
      def message
        'invalid_query'
      end
    end
  end

  class Invalid
    class FilterParams < Invalid
      def message
        'invalid_filters'
      end
    end
  end

  class Invalid
    class Deadline < Invalid
      def message
        'out_of_time_range'
      end
    end
  end

  class Invalid
    class Language < Invalid
      def message
        'invalid_language'
      end
    end
  end

  class Invalid
    class Admin < Invalid
      def message
        'invalid_admin'
      end
    end
  end

  class Invalid
    class ProgrammedSpace < Invalid
      def message
        'space_has_activities'
      end
    end
  end

  class Invalid
    class EmptyCall < Invalid
      def message
        'call_has_participants'
      end
    end
  end

  class Invalid
    class EmptyProposals < Invalid
      def message
        'form_has_proposals'
      end
    end
  end

  class Invalid
    class EmptyProgram < Invalid
      def message
        'program_has_activities'
      end
    end
  end

  class Invalid
    class FutureEvent < Invalid
      def message
        'past_event'
      end
    end
  end

  class Invalid
    class DateTime < Invalid
      def message
        'invalid_dateTime'
      end
    end
  end

  class Invalid
    class ExistingSlug < Invalid
      def message
        'existing_slug'
      end
    end
  end
end
