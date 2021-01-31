class ProposalManager

	def self.for_artistproposal owner_id, user_id, params
		manager = ProposalManager.new owner_id, user_id, params, :artistproposals

		class << manager
			
			def create  
		    check_params_for_creating! 
		    return create_own_proposal if params[:own].is_true?
		    add_phone(params[:phone]) if (profile[:phone].blank? || profile[:phone][:value].blank?) 
		    with_production do |params|
		      proposal = create_proposal
    			send_proposal_mail({title: params[:title]}, :artist_proposal) unless owner_id == call[:user_id]
    			proposal
	    	end
	  	end

		  def delete
		  	proposal = delete_proposal_and_ :remove_activities, :remove_pictures, :remove_participant_from_call 
		    send_rejection_mail(proposal, {title: proposal[:title]}) unless (proposal[:own].is_true? || proposal[:user_id] == user_id || admin?)
		  	proposal
		  end

	  	private

	  	def with_production
		    params[:production_id] ||= Actions::UserCreatesProduction.run(owner_id, params.except(:id))[:id]
		    yield(params)
		  end

		  def remove_pictures proposal
		    Actions::UserDeletesArtistProposal.remove_pictures proposal
		  end

		  def remove_activities proposal
		    activities = Repos::Activities.get({'$and': [{participant_proposal_id: proposal[:id]}, {event_id: proposal[:event_id]}]})
		    Actions::UserDeletesActivities.run activities, proposal[:event_id]
		  end

	  end

    manager

	end


	def self.for_spaceproposal owner_id, user_id, params
		manager = ProposalManager.new owner_id, user_id, params, :spaceproposals

		class << manager
			
			def create 
		    check_params_for_creating! 
		    return create_own_proposal if params[:own].is_true?
		    add_phone(params[:phone]) if (profile[:phone].blank? || profile[:phone][:value].blank?) 
		    whith_space do |params|
			    proposal = create_proposal
			    send_proposal_mail({space_name: params[:space_name]}, :space_proposal) unless owner_id == call[:user_id]
			    proposal
			  end
		  end

		   def delete
		  	proposal = delete_proposal_and_ :remove_activities, :remove_pictures, :remove_space_from_order, :remove_participant_from_call 
		  	send_rejection_mail(proposal,  {title: proposal[:space_name]}) unless (proposal[:own].is_true? || proposal[:user_id] == user_id || admin?)
		    proposal
		  end


	  	private

	  	def whith_space 
	  		space = create_space(owner_id, params) unless (params[:own].is_true? || !params[:space_id].blank?)
		    params[:space_id] = space[:id] if params[:space_id].blank?
		    yield(params)
	  	end
	  	
		  def create_space owner_id, params
		    Actions::UserCreatesSpace.run owner_id, params.except(:id) if params[:space_id].blank?
		  end    

		  def remove_space_from_order proposal
		    Repos::Programs.remove_space proposal[:event_id], proposal[:id]
		  end

		  def remove_pictures proposal
		    Actions::UserDeletesSpaceProposal.remove_pictures proposal
		  end

		  def remove_activities proposal 
		    activities = Repos::Activities.get({'$and': [{host_proposal_id: proposal[:id]}, {event_id: proposal[:event_id]}]})
		    Actions::UserDeletesActivities.run activities, proposal[:event_id]
  		end

	  end

    manager

	end
	
	def initialize owner_id, user_id, params, db_key
    @call = Repos::Calls.get_by_id(params[:call_id])
    raise Pard::Invalid::UnexistingCall if @call.blank?
    @owner = Repos::Users.get_by_id(owner_id) 
    @profile =  Repos::Profiles.get_by_id params[:profile_id]
    @params = params
    @user_id = user_id
    @owner_id = owner_id
    @db_key = db_key
    @mailer = Services::Mails.new
  end


  def modify 
    raise Pard::Invalid::CallOwnership unless has_permission?
    check_params!
    form = get_form_blocks params
    proposal = params[:own].is_true? ? own_proposal_lib_dictionary(db_key).new(params, form).to_h : proposal_lib_dictionary(db_key).new(params, form).to_h
    modify_participant params if proposal[:own].is_true?
    ApiStorage.repos(db_key).modify proposal
    ApiStorage.repos(db_key).get_by_id proposal[:id]
  end


  def amend 
    raise Pard::Invalid::Deadline unless on_time?
    Actions::UpdateDbElement.run db_key, {
      id: params[:id],
      amend: params[:amend]
    }
  end
	
	def select_deselect 
	  raise Pard::Invalid::CallOwnership unless is_my_call? || admin?
	  proposal = ApiStorage.repos(db_key).select_deselect(params[:id])
	end



  private
  attr_reader :call, :event, :profile, :owner_id, :params, :owner, :user_id,:db_key

 
  def proposal_lib_dictionary db_key
  	lib = {
  		:artistproposals => ArtistProposal,
  		:spaceproposals => SpaceProposal
  	}
  	lib[db_key]
  end

   def own_proposal_lib_dictionary db_key
  	lib = {
  		:artistproposals => ArtistOwnProposal,
  		:spaceproposals => SpaceOwnProposal
  	}
  	lib[db_key]
  end

  def check_params! 
    raise Pard::Invalid::Params if params[:phone][:value].blank?
  end

  def check_deadline!
    raise Pard::Invalid::Deadline unless on_time?
  end

  def check_params_for_creating! 
    check_params! 
    check_deadline!
  end


  def create_proposal 
    form = get_form_blocks params
    proposal = proposal_lib_dictionary(db_key).new( params, form).to_h
    proposal.merge!(additional_new_proposal_fields) 
    ApiStorage.repos(db_key).save proposal
    proposal
  end

  def create_own_proposal
    raise Pard::Invalid::CallOwnership unless is_my_call? || admin?
    participant = create_participant params, owner_id
    params[:profile_id] = participant[:id]
    form = get_form_blocks params
    proposal = own_proposal_lib_dictionary(db_key).new(params, form).to_h
    proposal.merge!(additional_new_proposal_fields) 
    ApiStorage.repos(db_key).save proposal
    proposal
  end

  def additional_new_proposal_fields
    {
      user_id: owner_id,
      register_date: Time.now.to_i * 1000,
      selected: true
    }    
  end

  def delete_proposal_and_ *methods_to_run
    raise Pard::Invalid::Deadline unless on_time?   
    proposal = ApiStorage.repos(db_key).get_by_id params[:id]
    methods_to_run.each{|mtd| send(mtd, proposal)}
    ApiStorage.repos(db_key).delete proposal[:id]
    proposal
  end

	def get_form_blocks params
    Repos::Forms.get_form_blocks params[:form_id]
  end

  def create_participant params, owner_id
    participant_params = params.deep_dup
    participant_params[:id] = params[:profile_id] unless params[:profile_id].blank?
    Actions::CreatesParticipant.run(participant_params, owner_id)
  end

  def modify_participant params
    participant_params = params.deep_dup
    participant_params[:id] = params[:profile_id] unless params[:profile_id].blank?
    Services::Participants.modify participant_params
  end

  def remove_participant_from_call proposal
    Actions::RemoveParticipantFrom.call proposal  
  end

  def add_phone phone
    profile[:phone] = phone
    Repos::Profiles.modify profile
  end

  def has_permission?
    is_my_call? || is_whitelisted? || admin?
  end

  def admin?
    MetaRepos::Admins.exists?(user_id)
  end

  def is_my_call?
    call[:user_id] == user_id
  end

  def is_whitelisted?
     whitelisted_emails = call[:whitelist].map{ |allowed|
      allowed[:email]
    }
    whitelisted_emails.include? owner[:email]
  end

  def on_time?
    return true if has_permission?
    after_begining = call[:start].to_i/1000 < Time.now.to_i
    before_ending = call[:deadline].to_i/1000 > Time.now.to_i
    after_begining && before_ending
  end


  def finished? event
    ending_time = event[:eventTime].map{|evt| evt[:time].map(&:to_i)}.flatten.max
    Time.now.to_i * 1000 > ending_time
  end

  def send_proposal_mail payload, mail_type_key
    receiver = owner
    receiver[:email] = profile[:email][:value]
    organizer = Repos::Profiles.get_by_id call[:profile_id]
    event = Repos::Events.get_by_id call[:event_id]
    payload = payload.merge({organizer_mail: organizer[:email][:value], event_name: event[:name], event_id: event[:id],profile_name: profile[:name], profile_id: profile[:id]})
    @mailer.deliver_mail_to receiver, mail_type_key, payload
  end

  def send_rejection_mail proposal, payload
    receiver = owner
    event = Repos::Events.get_by_id proposal[:event_id]
    profile = Repos::Profiles.get_by_id proposal[:profile_id]
    organizer = Repos::Profiles.get_by_id(event[:profile_id])
    receiver[:email] = profile[:email][:value]
    return false if finished?(event)
    payload = payload.merge({organizer: organizer[:name], event_name: event[:name]})
    @mailer.deliver_mail_to receiver, :rejected, payload
  end


end