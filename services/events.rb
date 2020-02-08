module Services
  class Events
    class << self

      def get_app_event event_id
        event = Repos::Events.get_by_id event_id
        program = Services::Programs.arrange_program event[:program_id]
        program.map!{|performance|
          performance[:participant_category] = performance[:participant_category]
          performance[:host_category] = performance[:host_category]
          performance.delete(:participant_subcategory)
          performance.delete(:host_subcategory)
          performance.delete(:comments)
          performance.delete(:confirmed)
          performance.delete(:participant_proposal_id)
          performance.delete(:host_proposal_id)
          performance
        }
        e_name = event[:name]
        dates = event[:eventTime].map{|evt| evt[:date]}
        dates.pop
        program = event[:program]
        {name: e_name, dates: dates, shows: program}
      end

      def get_event_program event_id
        CachedEvent.program event_id
      end  

      def get_event_program_hosts event_id
        CachedEvent.program_hosts event_id
      end      

      def get_events
        events = get_all_events
        ordered_events = events.map do |event|
          event.delete(:partners)
          event.delete(:qr)
          profile = Repos::Profiles.get_by_id(event[:profile_id])
          unless profile
            profile = MetaRepos::Participants.get_by_id(event[:profile_id])
            event[:profile_id] += '-own'
          end
          add_basic_call_program_info event
          event[:organizer] = profile[:name]
          event[:color] = profile[:color]
          event
        end.sort_by do |e| 
            e_finish = e[:eventTime].map{|evt| evt[:time].map(&:to_i)}.flatten.max
            dif = e_finish.to_i - Time.now.to_i * 1000 
            dif = -1000 * dif if dif < 0
            -dif
          end 
        ordered_events
      end

      def add_basic_call_program_info event
        if event[:call_id]
          call = Repos::Calls.get_by_id event[:call_id]
          event[:deadline] = call[:deadline] 
          event[:start] = call[:start] 
        end
        if event[:program_id]
          event[:published] = Repos::Programs.is_publish? event[:program_id]
        end
      end

      private

      def get_all_events
        Repos::Events.all
      end

    end
  end
end
