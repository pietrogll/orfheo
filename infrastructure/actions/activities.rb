# frozen_string_literal: true

module Actions
  class UserCreatesActivities
    def self.run(params, owner_id)
      event = Repos::Events.get_by_id(params[:event_id])
      host_id = event[:profile_id]
      CachedEvent.delete params[:event_id]

      activities_data = Util.arrayify_hash(params[:performances])
      activities_data.map do |activity|
        # Populate mandatory fields for Activity.new
        activity[:event_id] ||= params[:event_id]
        activity[:program_id] ||= params[:program_id]
        activity[:host_id] ||= host_id
        activity[:permanent] = false if activity[:permanent].nil?

        # Convert old-style date/time to dateTime array if missing
        if activity[:dateTime].blank?
          date = activity[:date] || event[:date_from]
          time = activity[:time] || activity[:start_time] || '00:00'
          activity[:dateTime] = [{ date: date, time: time }]
        end

        new_participant = nil
        if activity[:participant_id].blank?
          new_participant = create_participant activity, owner_id
          activity[:participant_id] = new_participant[:id]
        end

        new_activity = create_and_save_activity activity
        add_activity_to_program new_activity
        add_participants_to_program new_activity
        add_participant_info new_activity, new_participant if new_participant
        new_activity
      end
    end

    def self.create_and_save_activity(activity)
      new_activity = Activity.new(activity).to_h
      Repos::Activities.save new_activity
      new_activity
    end

    def self.create_participant(activity, owner_id)
      Actions::CreatesParticipant.run activity, owner_id
    end

    def self.add_activity_to_program(activity)
      Repos::Programs.add_activity(activity[:program_id], activity[:id])
    end

    def self.add_participants_to_program(activity)
      program_id = activity[:program_id]
      participants = Repos::Programs.get_participants program_id
      Repos::Programs.add_participant(program_id, activity[:host_id]) unless participants.include? activity[:host_id]
      return if participants.include? activity[:participant_id]

      Repos::Programs.add_participant(program_id,
                                      activity[:participant_id])
    end

    def self.add_participant_info(activity, participant)
      activity[:participant_name] = participant[:name]
      activity[:phone] = participant[:phone]
      activity[:email] = participant[:email][:value]
      activity[:own_participant] = true
    end
  end

  class UserModifiesActivities
    def self.run(params, _owner_id = nil)
      CachedEvent.delete params[:event_id]
      modify Util.arrayify_hash(params[:performances])
    end

    def self.modify(activities)
      activities.map do |activity_data|
        existing = Repos::Activities.get_by_id(activity_data[:id])
        raise Pard::Invalid::UnexistingActivity unless existing

        # Merge existing data with new data (excluding id)
        merged_data = existing.merge(activity_data)

        # Ensure permanent is set
        merged_data[:permanent] = false if merged_data[:permanent].nil?

        # Convert old-style date/time to dateTime array if missing (for tests/legacy)
        if merged_data[:dateTime].blank? && (merged_data[:date] || merged_data[:time] || merged_data[:start_time])
          date = merged_data[:date] || '2025-01-01' # Fallback
          time = merged_data[:time] || merged_data[:start_time] || '00:00'
          merged_data[:dateTime] = [{ date: date, time: time }]
        end

        begin
          new_activity = Activity.new(merged_data).to_h
          Repos::Activities.modify new_activity
          new_activity
        rescue Pard::Invalid, Pard::Unexisting => e
          # puts "DEBUG: UserModifiesActivities failed for #{activity_data[:id]}: #{e.message}"
          raise e
        end
      end
    end

    def self.check_existence!(activity_id)
      raise Pard::Invalid::UnexistingActivity unless Repos::Activities.exists? activity_id
    end
  end

  class UserDeletesActivities
    def self.run(params, _event_id)
      CachedEvent.delete params[:event_id]
      # Handle both 'performances' (array of objects with :id) and 'performance_ids' (array of IDs)
      performance_ids = if params[:performance_ids].is_a?(Array)
                          params[:performance_ids]
                        else
                          Util.arrayify_hash(params[:performances]).map { |p| p[:id] }.compact
                        end

      performance_ids.map do |activity_id|
        activity = Repos::Activities.get_by_id activity_id
        next unless activity

        Repos::Activities.delete activity_id
        remove_activity_from_program activity
        remove_participant_from_program activity
        activity
      end.compact
    end

    def self.remove_activity_from_program(activity)
      Repos::Programs.remove_activity activity[:program_id], activity[:id]
    end

    def self.remove_participant_from_program(activity)
      Actions::RemoveParticipantFrom.program activity
    end
  end

  class UserGetsEventProfileActivities
    def self.run(event_id, profile_id)
      Repos::Activities.get({ '$and': [{ event_id: event_id },
                                       { "$or": [{ host_id: profile_id }, { participant_id: profile_id }] }] })
    end
  end
end
