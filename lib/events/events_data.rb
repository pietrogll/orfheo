class EventData

  def initialize event_id, user_id = nil, lang = nil
    @event = Repos::Events.get_by_id event_id
    @program = Repos::Programs.get_by_id event[:program_id]
    @call = Repos::Calls.get_by_id event[:call_id]
    @artist_proposals = Repos::Artistproposals.get(event_id: event_id)
    @space_proposals = Repos::Spaceproposals.get(event_id: event_id)
    @activities = Repos::Activities.get({program_id: event[:program_id]})
    @lang = lang || 'es' #|| event[:default_lang]
    @user_id = user_id
    @profile_owner = Repos::Profiles.get_by_id(event[:profile_id]) 
    unless @profile_owner
      @profile_owner = MetaRepos::Participants.get_by_id(event[:profile_id])
      @event[:profile_id] += '-own'
    end
  end

  def for_manager
    # Proposals
    event[:artists] = artist_proposals.inject([]) do |artists_list, proposal| 
        Actions::UserGetsArtistsList.run proposal, artists_list
    end
    event[:spaces] = space_proposals.map{|proposal| 
      Actions::UserGetsSpace.run(proposal)
    }
    # Add participants that only have activities
    # Program
    if program
      event[:artists] += participants_without_proposals
      event[:order] = program[:order]
      event[:subcategories_price] = program[:subcategories_price] unless program[:subcategories_price].blank?
      event[:program] = arranged_program
      event[:published] = program[:published]
      event[:subcategories] = program[:subcategories]
      event[:texts] = get_by_lang program, :texts, lang
      event[:permanents] = program[:permanents] unless program[:permanents].blank?
    end
    # Call and Forms
    if call
      event[:whitelist] = call[:whitelist]
      forms = Actions::UserGetsForms.get_forms(call[:id], lang, user_id, true)
    end
    # Profile organizer
    event[:organizer_phone] = profile_owner[:phone]
    event[:organizer_email] = profile_owner[:email][:value]
    event[:color] = profile_owner[:color]
    # return
    [event.except(:img, :partners, :place), forms]
  end

  def for_event_page
    user = Repos::Users.get_by_id(user_id)
    
    # Program
    if program 
      event[:program] = (program[:published].is_true? || is_owner?) ? program_for_event_page : []
      event[:published] = program[:published]
      event[:subcategories] = get_by_lang(program, :texts, lang)[:subcategories]
      event[:subcategories_icons] = program[:subcategories]
      event[:display_program] = program[:display_program]
    end
    # Call
    if call
      whitelist = call[:whitelist] || []
      whitelisted_query = false
      whitelisted_query = (user_id == event[:user_id] || whitelist.any?{|whitelisted| whitelisted[:email] == user[:email]}) unless user_id.nil?
      event[:whitelisted] = whitelisted_query
      event[:start] = call[:start]
      event[:deadline] = call[:deadline]
      event[:conditions] = call[:conditions]
    end
    # Profile organizer
    event[:color] = profile_owner[:color]
    event[:organizer] = profile_owner[:name]
    event[:organizer_email] = profile_owner[:email]
    #return
    [event, lang]
  end

  def program_for_event_page
    CachedEvent.program(event[:id]) || arranged_program(false)
  end

  def arranged_program for_manager=true
    made_up_program = Services::Programs.make_up_program_with(activities, program, artist_proposals, space_proposals, for_manager)
    CachedEvent.write(event[:id], made_up_program) unless for_manager
    made_up_program || []
  end

  
  private
  attr_reader :event, :program, :space_proposals, :artist_proposals, :activities, :lang, :user_id, :call, :profile_owner

  def find_by_id array_collection, _id
    array_collection.find{|item| item[:id] == _id} 
  end  

  def is_owner?
    user_id == event[:user_id] || MetaRepos::Admins.exists?(user_id)
  end

  def get_by_lang object, field, lang = nil
    Actions::GetByLang.run object, field, lang
  end

  def participants_without_proposals
    call_participants = call.nil? ? [] : (call[:participants] || [])
    program_participants = program.nil? ? [] : (program[:participants] || [])
    participants_without_proposals_ids = program_participants - call_participants
    participants_without_proposals_ids.map do |id|
      artist = Repos::Profiles.get_by_id(id)
      if artist.blank?
        artist = Actions::UserGetsArtistsList.new_artist(MetaRepos::Participants.get_by_id(id)) 
        artist[:profile_id] += '-own' 
        artist[:own] = true
        artist
      else
        Actions::UserGetsArtistsList.new_artist(artist)
      end      
    end
  end

end