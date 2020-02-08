module Services
  class Programs
    class << self

      def arrange_program program_id, activities = nil
        program = Repos::Programs.get_by_id program_id
        return nil if program.blank?
        activities = Repos::Activities.get({program_id: program_id}) if activities.nil?
        artist_proposals = Repos::Artistproposals.get({event_id: program[:event_id]})
        space_proposals = Repos::Spaceproposals.get({event_id: program[:event_id]})
        make_up_program_with(activities, program, artist_proposals, space_proposals, false)
      end


      def make_up_program_with activities, program, artist_proposals, space_proposals, for_manager=true
        space_order = program[:order]
        activities.inject([]) do |program, activity|
          activity = add_profiles_info activity    
          activity = make_up_activity_with artist_proposals, space_proposals, activity
          order = space_order.index{ |host_id| host_id == activity[:host_proposal_id] }
          activity.merge! order: order
          activity_splitted =  split_activity_by_dateTime(activity, for_manager) 
          program = program + activity_splitted
        end
      end

      def split_activity_by_dateTime activity, for_manager=true
        Util.arrayify_hash(activity[:dateTime]).inject([]) do |activity_splitted, dt|
          single_activity = activity.clone
          single_activity[:date] = dt[:date]
          single_activity[:time] = dt[:time]
          if for_manager
            single_activity[:id_time] = dt[:id_time]
            activity_splitted.push(single_activity)
          else  
            activity_splitted.push(single_activity.except(
              :comments, 
              :dateTime, 
              :host_proposal_id, 
              :participant_proposal_id,
              :program_id,
              :confirmed,
              :event_id
            ))
          end
          activity_splitted
        end
      end

      def arrange_ids activities
        activities.map do |activity|
          activity[:host_id] += '-own' unless Repos::Profiles.exists? activity[:host_id]
          activity[:participant_id] += '-own' unless Repos::Profiles.exists? activity[:participant_id]
          split_activity_by_dateTime activity
        end.flatten
      end

      def make_up_activity_with artist_proposals, space_proposals, activity
        add_space_proposal_info(space_proposals, add_artist_proposal_info(artist_proposals, activity))
      end

      private


      def find_by_id array_collection, _id
        array_collection.find{|item| item[:id] == _id} 
      end

      def add_profiles_info activity
        artist_profile = Repos::Profiles.get_by_id activity[:participant_id]
        if artist_profile.blank?
          artist_profile = Repos::Participants.get_by_id activity[:participant_id]
          activity[:participant_id] = activity[:participant_id] + '-own'
        end
        activity[:host_id] = activity[:host_id] + '-own' unless Repos::Profiles.exists?(activity[:host_id])
        activity.merge! participant_name: artist_profile[:name]
      end

      def add_artist_proposal_info artist_proposals, activity
        unless artist_proposals.blank?
          artist_proposal = find_by_id artist_proposals, activity[:participant_proposal_id]
          unless artist_proposal.blank?
            [:title, :short_description, :children].each{|k|
              activity[k] = artist_proposal[k] if activity[k].blank?
            }
            activity[:participant_category] = artist_proposal[:category] if activity[:participant_category].blank?
            activity[:participant_subcategory] = artist_proposal[:subcategory] if activity[:participant_subcategory].blank?
          end
        end
        activity
      end

      def add_space_proposal_info space_proposals, activity
        unless space_proposals.blank?
          space_proposal = find_by_id space_proposals, activity[:host_proposal_id]
          unless space_proposal.blank? 
            activity.merge! host_name: space_proposal[:space_name]
            activity.merge! address: space_proposal[:address]
            activity.merge! host_subcategory: space_proposal[:subcategory]
          end
        end
        activity
      end

    end
  end
end
