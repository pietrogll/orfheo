module Services
  class Profiles
    class << self

      def make_up profile
        profile_id = profile[:id]
        spaces = Repos::Spaces.get_all_profile_spaces profile_id
        spaces.each{ |space| 
          space[:ambients] = MetaRepos::Ambients.get(space_id: space[:id]).map{ |amb| amb.except(:user_id, :space_id)}
        } unless spaces.blank?
        productions = Actions::UserGetsProfileProductions.with_tags profile_id
        free_blok = Repos::FreeBlocks.get_profile_free_block profile_id
        gallery = MetaRepos::Galleries.get(profile_id: profile_id)
        history = get_history(profile_id)
        upcoming = get_upcoming(profile_id)
        profile[:portfolio] = {proposals: productions} unless productions.blank?
        profile[:space] = spaces unless spaces.blank?
        profile[:free_block] = free_blok unless free_blok.blank?
        profile[:gallery] = gallery unless gallery.blank?
        profile[:history] = history unless history.blank?
        profile[:upcoming] = upcoming unless upcoming.blank?
        profile[:tags] = Actions::UserGetsTextTags.of profile
        profile
      end

      def get_history profile_id
        info = {}
        info[:call_proposals] = my_call_proposals(profile_id)
        info[:events] =  my_events(profile_id, false)
        info[:activities] = my_program(profile_id, false)
        info.reject{|key, el| el.blank?}
      end

      def get_upcoming profile_id
        info = {}
        info[:activities] = my_program(profile_id, true)
        info[:events] = my_events(profile_id, true)
        info.reject{|key, el| el.blank?}
      end


      def update_participations profile_id
        if participate?(profile_id) || is_organizer?(profile_id)
          update_artistproposals profile_id
          update_spaceproposals profile_id
          make_participant profile_id
        end   
      end

      private
      
      def make_participant profile_id
        profile = Repos::Profiles.get_by_id profile_id
        participant = new_participant_from_profile profile
        MetaRepos::Participants.save participant
      end

      def new_participant_from_profile params
        {
          id: params[:id],
          email: params[:email],
          name: params[:name],
          address: params[:address],
          phone: params[:phone],
          facets: params[:facets],
          color: params[:color] 
        }
      end

      
      def my_events profile_id, is_future
        events = Repos::Events.get({profile_id: profile_id})
        events.select do |event|
          date = event[:eventTime].map{|evt| evt[:date]}.max
          event.delete(:partners)
          event.delete(:qr)
          event.delete(:subcategories)
          event.delete(:slug)
          event[:participants] = Repos::Programs.get_participants event[:program_id] unless event[:program_id].blank?
          is_past =  Time.now > Time.parse(date) + 30 * 60* 60
          Services::Events.add_basic_call_program_info event if is_future
          is_future != is_past  
        end.sort! do |e1, e2| 
          d1 = e1[:eventTime].map{|evt| evt[:date]}.min
          d2 = e2[:eventTime].map{|evt| evt[:date]}.min
          d2 <=> d1
        end
      end

      def my_call_proposals profile_id
        proposals = {}
        proposals[:artist] = my_artist_proposals(profile_id) 
        proposals[:space] = my_space_proposals(profile_id)
        proposals.delete(:artist) if proposals[:artist].blank?
        proposals.delete(:space) if proposals[:space].blank?
        proposals
      end

      def my_artist_proposals profile_id
        proposals = Repos::Artistproposals.get(profile_id: profile_id)
        proposals.map do |proposal|
          event = Repos::Events.get_by_id proposal[:event_id]
          date = event[:eventTime].map{|evt| evt[:date]}.max
          next if Time.now > Time.parse(date) + 30 * 60* 60
          call = Repos::Calls.get_by_id proposal[:call_id]
          profile = Repos::Profiles.get_by_id proposal[:profile_id] 
          proposal[:event_name] = event[:name]
          proposal[:deadline] = call[:deadline]
          proposal[:color] = profile[:color]
          proposal
        end.compact.flatten
      end

      def my_space_proposals profile_id
        proposals = Repos::Spaceproposals.get(profile_id: profile_id)
        proposals.map do |proposal|
          event = Repos::Events.get_by_id proposal[:event_id]
          # event[:eventTime].delete(:permanent)
          date = event[:eventTime].map{|evt| evt[:date]}.max
          next if Time.now > Time.parse(date) + 30 * 60* 60
          call = Repos::Calls.get_by_id proposal[:call_id]
          profile = Repos::Profiles.get_by_id proposal[:profile_id] 
          proposal[:event_name] = event[:name]
          proposal[:deadline] = call[:deadline]
          proposal[:color] = profile[:color]
          proposal
        end.compact.flatten
      end

      def my_program profile_id, is_future
        my_activities = Repos::Activities.get(participant_id: profile_id) + Repos::Activities.get(host_id: profile_id)
        my_activities_sorted_by_event_id = my_activities.inject({}) do |activities_obj, activity|
          next activities_obj unless Repos::Programs.is_publish?(activity[:program_id])
          if activities_obj[activity[:event_id]].nil?
            activities_obj[activity[:event_id]] =  [activity] 
          else 
            activities_obj[activity[:event_id]].push(activity) unless activities_obj[activity[:event_id]].include? activity
          end
          activities_obj
        end
        my_activities_sorted_by_event_id.keys.map do |event_id|
          event = Repos::Events.get_by_id event_id
          # event[:eventTime].delete(:permanent)
          date =event[:eventTime].map{|evt| evt[:date]}.max
          is_past =  Time.now > Time.parse(date) + 30 * 60* 60
          next if is_future == is_past
          {
            event_id: event_id,
            event_name: event[:name],
            date: date,
            shows: Services::Programs.arrange_program(event[:program_id], my_activities_sorted_by_event_id[event_id])
          }
        end.compact.sort_by{|event_activities| event_activities[:date]}.reverse
      end

      def participate? profile_id
        return true if Repos::Calls.all.any?{ |call|  
          call[:participants].blank? ? false : call[:participants].include?(profile_id)
        } 
        proposals = Repos::Artistproposals.get({profile_id: profile_id}) + Repos::Spaceproposals.get({profile_id: profile_id})
        !proposals.empty?
      end

      def is_organizer? profile_id
        !Repos::Events.get({profile_id: profile_id}).empty? || !Repos::Calls.get({profile_id: profile_id}).empty?
      end

      def update_artistproposals profile_id
        Repos::Artistproposals.delete_profile profile_id
      end

      def update_spaceproposals profile_id
        Repos::Spaceproposals.delete_profile profile_id
      end

    end
  end
end
