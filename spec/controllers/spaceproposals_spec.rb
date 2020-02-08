describe SpaceProposalsController do

  include_examples 'http_methods'
  include_examples 'ids'
  include_examples 'params'
  include_examples 'db_elements'
  include_examples 'models'
  
  let(:mailer){Services::Mails.new}


  before(:each){
    Repos::Users.save user
    Repos::Users.save call_participant_user
    Repos::Users.save other_user
    Repos::Users.save admin_user 
    MetaRepos::Admins.save admin
    Repos::Profiles.save profile
    Repos::Profiles.save call_participant_profile
    Repos::Programs.save program
    Repos::Activities.save activity
    Repos::Forms.save artist_form_1
    Repos::Forms.save artist_form_2
    Repos::Forms.save space_form_1
    Repos::Forms.save space_form_2
    Repos::Events.save event
    Repos::Events.save(otter_event)
    Repos::Calls.save(call)
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user
    allow(Services::WsClients).to receive(:send_message).and_return(true)
    allow(Services::Mails).to receive(:new).and_return(mailer)
  }


  describe 'Send_space_proposal' do

    before(:each){
      allow(SecureRandom).to receive(:uuid).and_return(space_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      post logout_route
      post login_route, call_participant_user
    }

      it 'fails if the call does not exist' do
      spaceproposal_params[:call_id] = 'otter'
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'fails if the profile does not exist' do
      spaceproposal_params[:profile_id] = 'otter'
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if not the profile owner' do
      post logout_route
      post login_route, other_user
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end


    it 'fails if form does not exist' do
      spaceproposal_params[:form_id] = 'otter'
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_form')
    end

    it 'fails if out of deadline' do
      allow(Time).to receive(:now).and_call_original
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if it does not include mandatory form fields' do
      spaceproposal_params.delete(:'2')
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      spaceproposal_params[:user_id] = user_id
      spaceproposal_params[:profile_id] = profile_id
      post logout_route
      post login_route, user
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, admin_user
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'does not fail out of deadline if event owner' do
      post logout_route
      post login_route, user
      allow(Time).to receive(:now).and_return(Time.new(2016, 07, 02))
      spaceproposal[:register_date] = Time.new(2016, 07, 02).to_i*1000
      space_model[:register_date] = Time.new(2016, 07, 02).to_i*1000
      spaceproposal_params[:user_id] = user_id
      spaceproposal_params[:profile_id] = profile_id
      space_model[:name] = 'name'
      spaceproposal[:user_id] = user_id
      spaceproposal[:profile_id] = profile_id
      space_model[:profile_id] = profile_id
      expect(Repos::Spaceproposals).to receive(:save).with(spaceproposal)
      allow(mailer).to receive(:deliver_mail_to)
      spaceproposal_params[:profile_id] = profile_id
      spaceproposal_params[:id] = space_proposal_id
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_model))
    end

    it 'adds a new space if non existing' do
      new_space = {
        id: space_id,
        name: 'space_name',
        address: 'address',
        type: 'space_type',
        description: 'space_description',
        ambients:[{
          name: 'ambient_name',
          description:'ambient_description',
          allowed_categories: ['music'],
          allowed_formats:['concert']
        }]
      }
      expect(mailer).to receive(:deliver_mail_to)
      expect(Repos::Spaces).to receive(:save).with(hash_including({
        name: 'space_name',
        address: 'address',
        type: 'space_type',
        description: 'space_description',
       })).and_call_original
      # new_space.except(:ambients)
      expect(Repos::Ambients).to receive(:save).with(hash_including({
          name: 'ambient_name',
          description:'ambient_description',
          allowed_categories: ['music'],
          allowed_formats:['concert']
        })).and_call_original
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      spaceproposal_params[:space_id] = nil
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'does not add a new space if already existing' do
      expect(mailer).to receive(:deliver_mail_to)
      expect(Repos::Spaces).not_to receive(:save)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      spaceproposal_params[:space_id] = space_id
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'sends the proposal' do
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      spaceproposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      space_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      expect(Repos::Spaceproposals).to receive(:save).with(spaceproposal)
      allow(mailer).to receive(:deliver_mail_to)
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_model))    
    end

    it 'adds proposal_id to order in corresponding program' do
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      spaceproposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      expect(Repos::Spaceproposals).to receive(:save).with(spaceproposal)
      allow(mailer).to receive(:deliver_mail_to)
      expect(Repos::Programs).to receive(:add_space).with(event_id, space_proposal_id).and_call_original
      post send_space_proposal_route, spaceproposal_params
      expect(Repos::Programs.get(event_id: event_id)[0][:order]).to eq([space_proposal_id])
    end


    it 'adds profile_id to participants in corresponding event' do
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      expect(Repos::Calls).to receive(:add_participant).with(call_id, call_participant_profile_id).and_call_original
      allow(mailer).to receive(:deliver_mail_to)
      post send_space_proposal_route, spaceproposal_params
      expect(Repos::Calls.get_by_id(call_id)[:participants]).to eq([call_participant_profile_id])
    end

    it 'sends the proposal mail to the applicant'do
      moked_time = Time.new(2016, 05, 02)
      allow(Time).to receive(:now).and_return(moked_time)
      receiver[:last_login] = moked_time.to_i*1000

      expect(mailer).to receive(:deliver_mail_to).with(receiver, :space_proposal, {organizer_mail: 'contact_email@test.com', event_name: 'event_name',event_id: event_id, space_name: 'space_name', profile_name:'name', profile_id: call_participant_profile_id})
      post send_space_proposal_route, spaceproposal_params
    end

    it 'adds phone to profile if it has not' do
      call_participant_profile[:phone] = nil
      Repos::Profiles.modify call_participant_profile
      expect(Repos::Profiles).to receive(:modify).with(hash_including(phone:  Util.stringify_hash(phone)))
      expect(mailer).to receive(:deliver_mail_to)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      # space[:register_date] = Time.new(2016, 07, 02).to_i*1000
      post send_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end
  end

  describe 'Sends own space proposal' do

    before(:each){
      allow(SecureRandom).to receive(:uuid).and_return(profile_id)
      post logout_route
      post login_route, user
    }

  
    it 'fails if the call does not exist' do
      own_spaceproposal_params[:call_id] = 'otter'
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'fails if not the event owner' do
      post logout_route
      post login_route, other_user
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if it does not include profile mandatory orfheo fields' do
      own_spaceproposal_params.delete(:address)
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post logout_route
      post login_route, admin_user
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'sends space own proposal' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:id] = profile_id
      own_spaceproposal_params.delete(:id)
      space_own_model[:proposal_id] = profile_id

      expect(Repos::Spaceproposals).to receive(:save).with(own_space_proposal)
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_own_model))
    end

    it 'adds proposal_id to order in corresponding program' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:id] = space_proposal_id

      expect(Repos::Programs).to receive(:add_space).with(event_id, space_proposal_id).and_call_original
      post send_space_proposal_route, own_spaceproposal_params
      expect(Repos::Programs.get(event_id: event_id)[0][:order]).to eq([space_proposal_id])
    end

    it 'does not allow own-proposals with equal name but different profile_id' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000 
      post send_space_proposal_route, own_spaceproposal_params
      own_spaceproposal_params[:id] = nil

      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('existing_name')
    end

    it 'sends space own proposal if admin' do
      post logout_route
      post login_route, admin_user
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:id] = profile_id
      space_own_model[:proposal_id] = profile_id
      own_spaceproposal_params.delete(:id)

      expect(Repos::Spaceproposals).to receive(:save).with(own_space_proposal)
      post send_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_own_model))
    end

    it'creates a new participant when sending own proposal' do 
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:register_date] = Time.new(2016, 05, 02).to_i*1000
      own_space_proposal[:id] = profile_id
      own_spaceproposal_params.delete(:id)
      space_own_model[:proposal_id] = profile_id

      expect(MetaRepos::Participants).to receive(:save).and_call_original
      post send_space_proposal_route, own_spaceproposal_params
    end 

  end


    describe 'Amend_space_proposal' do

    before(:each){
      space_model[:amend] = 'new_amend'
      post login_route, call_participant_user
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      spaceproposal_params[:id] = space_proposal_id
      expect(mailer).to receive(:deliver_mail_to)
      post send_space_proposal_route, spaceproposal_params
    }

    let(:amend){
      {
        event_id: event_id,
        call_id: call_id,
        id: space_proposal_id,
        # space_id: space_id,
        amend: 'new_amend'
      }
    }

    it 'fails if the proposal does not exist' do
      amend[:id] = 'space_proposal_id'
      post amend_space_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end

    it 'fails if the user is out of time' do
      allow(Time).to receive(:now).and_return(Time.new(1976, 05, 02))
      post amend_space_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if the user does not own the proposal' do
      post logout_route
      post login_route, other_user
      post amend_space_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'amends the proposal' do
      expect(Repos::Spaceproposals).to receive(:modify).with({id: space_proposal_id, amend: 'new_amend'})
      post amend_space_proposal_route, amend
      expect(parsed_response['status']).to eq('success')
    end
  end

   describe 'Modify_space_proposal' do

    before(:each){
      post logout_route
      post login_route, call_participant_user
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      spaceproposal_params[:id] = space_proposal_id
      spaceproposal_params[:space_id] = space_id
      expect(mailer).to receive(:deliver_mail_to)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      post send_space_proposal_route, spaceproposal_params
      post logout_route
      post login_route, user
      allow(SecureRandom).to receive(:uuid).and_call_original
    }

    it 'fails if the user does not own the proposal nor the call and is not an admin' do
      post logout_route
      post login_route, other_user
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if the proposal does not exist' do
      spaceproposal_params[:id] = 'otter'
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end


    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post logout_route
      post login_route, admin_user
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'modifies the proposal space if event owner' do
      spaceproposal[:ambients] = [{:name=>"ambient_name",
                 :description =>"ambient_description",
                  :allowed_categories =>["music"],
                 allowed_formats: ["concert"],
                 capacity: '15',
                 photos: ["ambient_picture.jpg"]
                 }]
      space_model[:ambients] = [{"name"=>"ambient_name",
                 "description"=>"ambient_description",
                  "allowed_categories"=>["music"],
                 "allowed_formats"=>["concert"],
                 "capacity" => '15',
                 "photos"=>["ambient_picture.jpg"]
                 }]
      spaceproposal_params[:ambients][0][:'capacity'] = '15'
      spaceproposal_params[:'2'] = 'otter'
      spaceproposal[:'2'] = 'otter'
      space_model[:'2'] = 'otter'
      spaceproposal_params[:'1'] = 'q1'
      spaceproposal[:'1'] = 'q1'
      space_model[:'1'] = 'q1'
      space_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      expect(Repos::Spaceproposals).to receive(:modify).with(spaceproposal.except(:register_date, :selected)).and_call_original
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_model))
    end

    it 'modifies the proposal space if admin' do
      post logout_route
      post login_route, admin_user
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      space_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_model))
    end


    it 'fails if particpant' do
      post logout_route
      post login_route, call_participant_user
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('fail')
    end


    it 'modifies the proposal space if particpant whitelisted' do
      post logout_route
      post login_route, call_participant_user
      Repos::Calls.add_whitelist call_id, [{email: call_participant_user[:email]}]
      post modify_space_proposal_route, spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      space_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_model))
    end

    it 'modifies own space proposal' do
      Repos::Spaceproposals.clear
      own_spaceproposal_params[:name] = 'own_space_name'
      own_spaceproposal_params[:id] = space_proposal_id

      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      post send_space_proposal_route, own_spaceproposal_params
      space_own_model[:name] = 'otter'
      own_spaceproposal_params[:name] = 'otter'

      own_spaceproposal_params[:profile_id] = space_proposal_id
      own_space_proposal[:profile_id] = space_proposal_id
      space_own_model[:profile_id] = space_proposal_id + '-own'

      space_own_model[:address] = 'otter_address'
      own_spaceproposal_params[:address] = 'otter_address'
      own_space_proposal[:address] = 'otter_address'
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000

      expect(Repos::Spaceproposals).to receive(:modify).with(own_space_proposal.except(:selected)).and_call_original
      post modify_space_proposal_route, own_spaceproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_own_model))
    end

    it 'modifies own space proposal if admin' do
      Repos::Spaceproposals.clear
      own_spaceproposal_params[:name] = 'own_space_name'
      own_space_proposal[:name] = 'own_space_name'
      space_own_model[:name] = 'own_space_name'
      own_spaceproposal_params[:id] = space_proposal_id

      allow(SecureRandom).to receive(:uuid).and_return(profile_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      space_own_model[:register_date] = Time.new(2016, 05, 02).to_i*1000
      post send_space_proposal_route, own_spaceproposal_params

      own_spaceproposal_params[:profile_id] = space_proposal_id
      own_space_proposal[:profile_id] = space_proposal_id
      space_own_model[:profile_id] = space_proposal_id + '-own'

      post logout_route
      post login_route, admin_user

      post modify_space_proposal_route, own_spaceproposal_params

      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(space_own_model))
    end

  end



  describe 'Delete_space_proposal' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      allow(SecureRandom).to receive(:uuid).and_return(space_proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      spaceproposal_params[:id] = space_proposal_id
      post send_space_proposal_route, spaceproposal_params
    }

    it 'fails if the proposal does not exist' do
      post delete_space_proposal_route, {event_id: event_id, id: 'otter', call_id: call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end

    it 'fails if the user is out of time' do
      allow(Time).to receive(:now).and_return(Time.new(1976, 05, 02))
      post delete_space_proposal_route, {event_id: event_id, id: space_proposal_id, call_id: call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post delete_space_proposal_route, {event_id: event_id, id: space_proposal_id, call_id: call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'allows event owner to delete and delivers rejection mail' do
      moked_time = Time.new(2016, 05, 02)
      receiver[:last_login] = moked_time.to_i*1000
      allow(Time).to receive(:now).and_return(moked_time)
      
      post logout_route
      post login_route, user
      expect(Repos::Spaceproposals).to receive(:delete).with(space_proposal_id)
      expect(mailer).to receive(:deliver_mail_to).with(receiver, :rejected, {organizer: 'name', event_name: 'event_name', title: 'space_name'})
      expect(Services::Assets).to receive(:update).once.with(["plane_picture.jpg", "ambient_picture.jpg"], space_proposal_id).and_return([])
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({"profile_id"=>call_participant_profile_id, "proposal_id"=>space_proposal_id})
    end

    it 'allows admin to delete and not delivers rejection mail' do
      post logout_route
      post login_route, admin_user
      expect(Repos::Spaceproposals).to receive(:delete).with(space_proposal_id)
      expect(mailer).not_to receive(:deliver_mail_to)
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({"profile_id"=>call_participant_profile_id, "proposal_id"=>space_proposal_id})
    end

    it 'allows proposal owner to delete and NOT deliver rejection mail' do
      expect(Repos::Spaceproposals).to receive(:delete).with(space_proposal_id)
      expect(mailer).not_to receive(:deliver_mail_to)
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'deletes participant if it has no proposals nor activities' do
      MetaRepos::Participants.save({id: call_participant_profile_id})
      Repos::Activities.clear 

      expect(Repos::Calls).to receive(:remove_participant).with(call_id, call_participant_profile_id)
      expect(MetaRepos::Participants).to receive(:delete).with(call_participant_profile_id)
      
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end


    it 'removes all the activities connected with the proposal and delete the corresponding CachedEvent' do
      expect(Repos::Activities).to receive(:delete).with(activity_id)
      expect(Repos::Programs).to receive(:remove_activity).with(program_id, activity_id)
      expect(CachedEvent).to receive(:delete).with(event_id)
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'deletes the artist_participants (from the MetaRepos) that do not have other proposals nor activities' do
      artist_participant_id = '00001c90-0000-49ff-b6b6-dfd53e45bb83'
      MetaRepos::Participants.save({id: artist_participant_id})
      Repos::Activities.save({id: 'otter_activity_id', host_proposal_id: space_proposal_id, event_id: event_id, program_id: program_id, participant_id: artist_participant_id})

      expect(MetaRepos::Participants).to receive(:delete).with(artist_participant_id)
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      
      expect(parsed_response['status']).to eq('success')
    end


    it 'removes space from order in program' do
      expect(Repos::Programs).to receive(:remove_space).with(event_id, space_proposal_id).and_call_original
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(Repos::Programs.get(event_id: event_id)[0][:order]).to eq([])

    end


    it 'does not send rejection mail if admin and event finished' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 11, 02)) 
      post logout_route
      post login_route, admin_user
      expect(Repos::Spaceproposals).to receive(:delete).with(space_proposal_id)
      expect(mailer).not_to receive(:deliver_mail_to)
      post delete_space_proposal_route, {event_id: event_id, id: space_proposal_id, call_id: call_id}
      expect(parsed_response['status']).to eq('success')
    end


    it 'deletes photos from numeric field' do
      post logout_route
      post login_route, user
      spaceproposal_params[:'1'] = ['nph1.jpg', 'nph2.jpg']
      post modify_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets).to receive(:delete).twice
      allow(Cloudinary::Api).to receive(:delete_resources).twice
      expect(Services::Gallery).to receive(:permanently_delete_unused).once.with(['plane_picture.jpg','ambient_picture.jpg','nph1.jpg', 'nph2.jpg'])
      post delete_space_proposal_route, {id: space_proposal_id, call_id: call_id, event_id: event_id}
    end

  end


  describe 'Assets'do
  
    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 02))
      allow(mailer).to receive(:deliver_mail_to)
      MetaRepos::Assets.clear
      post logout_route
      post login_route, call_participant_user
      # allow(SecureRandom).to receive(:uuid).and_call_original
    }


    it 'creates a new asset if picture used in a space proposal' do
      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].length).to eq(1)

    end


    it 'creates a new asset if picture used in a space proposal and add both space and proposal ids to holders' do
      spaceproposal_params[:space_id] = nil
      spaceproposal_params[:id] = space_proposal_id
      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)        
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'ambient_picture.jpg' ).first[:holders].length).to eq(2)
      space_model = Repos::Spaces.get({profile_id: call_participant_profile_id}).first
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].include?(space_model[:id])).to eq(true)
    end



    it 'is not deleted if proposal is deleted but space not' do
      spaceproposal_params[:space_id] = nil
      spaceproposal_params[:id] = space_proposal_id
      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].include?(space_proposal_id)).to eq(true)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].length).to eq(2)
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      post delete_space_proposal_route,  {id: space_proposal_id, call_id: call_id, event_id: event_id}
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'ambient_picture.jpg' ).first[:holders].length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg' ).first[:holders].include?(space_proposal_id)).to eq(false)
    end

    it 'is deleted if both proposal and space deleted' do
      spaceproposal_params[:space_id] = nil
      spaceproposal_params[:id] = space_proposal_id
      post send_space_proposal_route, spaceproposal_params
      expect(Cloudinary::Api).to receive(:delete_resources).with(['plane_picture.jpg']).exactly(1).times 
      expect(Cloudinary::Api).to receive(:delete_resources).with(['ambient_picture.jpg']).exactly(1).times 
      post delete_space_proposal_route,  {id: space_proposal_id, call_id: call_id, event_id: event_id}
      space_model = Repos::Spaces.get(profile_id: call_participant_profile_id).first
      post delete_space_route, space_model
      expect(MetaRepos::Assets.all.length).to eq(0)
    end


    it 'add a new holder for each new proposal sent' do
      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg').first[:holders].length).to eq(1)

      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg').first[:holders].length).to eq(2)

      post send_space_proposal_route, spaceproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'plane_picture.jpg').first[:holders].length).to eq(3)
    end

  end

  describe 'Select / Deselect' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      Repos::Spaceproposals.save spaceproposal
      Repos::Activities.delete activity[:id]
    }

    it 'fails if space has program' do
      Repos::Activities.save activity
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('space_has_activities')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2116, 05, 02))
      post delete_space_proposal_route, {event_id: event_id, id: space_proposal_id, call_id: call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end

    it 'switches true/false the field selected of the proposal' do 
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      expect(parsed_response['status']).to eq('success')
      saved_proposal = Repos::Spaceproposals.get_by_id space_proposal_id
      expect(saved_proposal[:selected]).to eq false
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      saved_proposal = Repos::Spaceproposals.get_by_id space_proposal_id
      expect(saved_proposal[:selected]).to eq true
    end

    it 'adds/removes the proposal_id from the order' do
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      expect(Repos::Programs.get(event_id: event_id).first[:order]).not_to include space_proposal_id 
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      expect(Repos::Programs.get(event_id: event_id).first[:order]).to include space_proposal_id
      post select_deselect_space_route, {id: space_proposal_id, event_id: event_id, call_id:call_id}
      expect(Repos::Programs.get(event_id: event_id).first[:order]).not_to include space_proposal_id  
    end

  end

end
  