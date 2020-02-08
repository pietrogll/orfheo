describe ArtistProposalsController do

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
    Repos::Activities.save activity
    Repos::Programs.save program
    Repos::Profiles.save profile
    Repos::Profiles.save call_participant_profile
    Repos::Events.save event
    Repos::Calls.save call
    Repos::Forms.save artist_form_1
    Repos::Forms.save artist_form_2
    Repos::Forms.save space_form_1
    Repos::Forms.save space_form_2
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post login_route, user_hash
    allow(Services::WsClients).to receive(:send_message).and_return(true)
    allow(Services::Mails).to receive(:new).and_return(mailer)
  }

  describe 'Send_artist_proposal' do

    before(:each){
      allow(SecureRandom).to receive(:uuid).and_return(production_id)      
    }

    it 'fails if the call does not exist' do

      artistproposal_params[:call_id] = 'otter'
      post send_artist_proposal_route, artistproposal_params

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'fails if the profile does not exist' do
      artistproposal_params[:profile_id] = 'otter'
      post send_artist_proposal_route, artistproposal_params

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_profile')
    end

    it 'fails if not the profile owner' do
      post logout_route
      post login_route, call_participant_user
      post send_artist_proposal_route, artistproposal_params

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end


    it 'fails if wrong category' do
      artistproposal_params[:category] = 'otter'
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_category')
    end

    it 'fails if the call does not include the form category' do
      artistproposal_params[:form_id] = 'arts'
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_form')
    end

    it 'adds a new production if non existing' do 
      expect(Repos::Productions).to receive(:save).with( hash_including(production.except(:production_id, :main_picture)))
      post send_artist_proposal_route, artistproposal_params.except(:production_id, :main_picture)
      expect(parsed_response['status']).to eq('success')
    end

    it 'does not add a new production if already existing' do 
      expect(Repos::Productions).not_to receive(:save)
      post send_artist_proposal_route, artistproposal_params
    end

    it 'fails if out of deadline and not call owner' do
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if it does not include mandatory form fields' do
      allow(Time).to receive(:now).and_return(Time.new(2002, 10, 31))
      artistproposal_params.delete(:'2')
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'does not fail out of deadline and return the artist if call owner and event not past' do
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2022, 10, 31))
      artistproposal_params[:call_id] = call_id
      expect(Repos::Artistproposals).to receive(:save).with(artistproposal)
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_model))
      
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2222, 01, 25))
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2222, 01, 25))
      post logout_route
      post login_route, admin_user
      post send_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
    end


    it 'sends the proposal and return the artist if call open' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 04, 28))
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      artist_model[:proposals].first[:register_date] = Time.new(2016, 04, 28).to_i*1000
      artistproposal[:register_date] = Time.new(2016, 04, 28).to_i*1000
      artistproposal_params[:profile_id] = call_participant_profile_id
      artist_model[:profile_id] = call_participant_profile_id
      artistproposal[:profile_id] = call_participant_profile_id
      artistproposal[:user_id] = call_participant_user_id        
      allow(mailer).to receive(:deliver_mail_to)
      expect(Repos::Artistproposals).to receive(:save).with(artistproposal)      
      post logout_route
      post login_route, call_participant_user
      post send_artist_proposal_route, artistproposal_params    
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_model))
    end

    it 'sends the proposal mail to the applicant if call open'do
      moked_time = Time.new(2016, 05, 01)
      allow(Time).to receive(:now).and_return(moked_time)
      receiver[:last_login] = moked_time.to_i*1000
      expect(mailer).to receive(:deliver_mail_to).with(receiver, :artist_proposal, {organizer_mail: 'contact_email@test.com', event_name: 'event_name',event_id: event_id, title: 'title', profile_name:'name', profile_id: call_participant_profile_id})
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      post send_artist_proposal_route, artistproposal_params
    end

    it 'adds phone to profile if it has not' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      artist_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      call_participant_profile[:phone] = {'visible'=>'false', 'value' => nil}
      artistproposal_params[:profile_id] = call_participant_profile_id
      artist_model[:profile_id] = call_participant_profile_id
      
      Repos::Profiles.modify call_participant_profile

      expect(mailer).to receive(:deliver_mail_to)
      expect(Repos::Profiles).to receive(:modify).with(hash_including(phone:  Util.stringify_hash(phone)))
     
      post logout_route
      post login_route, call_participant_user
      post send_artist_proposal_route, artistproposal_params

    end

    it 'adds profile_id of the applicant to the participants in the event' do 
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      expect(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      expect(Repos::Calls).to receive(:add_participant).with(call_id, call_participant_profile_id).once.and_call_original
      post send_artist_proposal_route, artistproposal_params
      expect(Repos::Calls.get_by_id(call_id)[:participants]).to eq([call_participant_profile_id])
    end

    it 'allows to send 2 proposals and add the participant' do 
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      expect(Repos::Calls).to receive(:add_participant).with(call_id, call_participant_profile_id).twice.and_call_original
      post send_artist_proposal_route, artistproposal_params
      expect(Repos::Artistproposals.count).to eq(1)
      expect(Repos::Calls.get_by_id(call_id)[:participants]).to eq([call_participant_profile_id])
      artistproposal_params[:title] = 'otter_title'
      post send_artist_proposal_route, artistproposal_params
      expect(Repos::Artistproposals.count).to eq(2)  
      expect(Repos::Calls.get_by_id(call_id)[:participants]).to eq([call_participant_profile_id])

    end

  end

  describe 'Sends own artist proposal' do

    before(:each){
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
    }

    it 'fails if the call does not exist' do
      own_artistproposal_params[:call_id] = 'otter'
      post send_artist_proposal_route, own_artistproposal_params

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'fails if not the event owner' do
      post logout_route
      post login_route, call_participant_user
      post send_artist_proposal_route, own_artistproposal_params

      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if it does not include mandatory orfheo fields' do
      own_artistproposal_params.delete(:title)
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'fails if it does not include profile mandatory orfheo fields' do
      own_artistproposal_params.delete(:short_description)
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_parameters')
    end

    it 'sends own artist proposal' do
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      expect(Repos::Artistproposals).to receive(:save).with(own_artist_proposal)
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_own_model))
    end

    it 'sends own artist proposal if admin' do
      post logout_route
      post login_route, admin_user
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      expect(Repos::Artistproposals).to receive(:save).with(own_artist_proposal)
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_own_model))
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2216, 05, 01))
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2216, 05, 01))
      post logout_route
      post login_route, admin_user
      post send_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('success')
    end

  end

  

  describe 'Amend_artist_proposal' do

    before(:each){
      artistproposal_params[:amend] = 'new_amend'
      artistproposal_params[:production_id] = production_id
      artistproposal_params[:proposal_id] = proposal_id
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      post send_artist_proposal_route, artistproposal_params
    }

    let(:amend){
      {
        event_id: event_id,
        call_id: call_id,
        id: proposal_id,
        amend: 'new_amend'
      }
    }

    it 'fails if the proposal does not exist' do
      amend[:id] = event_id
      post amend_artist_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end

    it 'fails if the user is out of time' do
      allow(Time).to receive(:now).and_return(Time.new(2017, 05, 01))
      post amend_artist_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if the user does not own the proposal, is not the admin and is not the call organizer' do
      post logout_route
      post login_route, other_user
      post amend_artist_proposal_route, amend
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'amends the proposal' do
      expect(Repos::Artistproposals).to receive(:modify).with({id: proposal_id, amend: 'new_amend'}).and_call_original
      post amend_artist_proposal_route, amend
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Artistproposals.get(id:proposal_id).first).to include({amend:'new_amend'})
    end
  end

  describe 'Modify_artist_proposal' do

    before(:each){
      artistproposal_params[:id] = proposal_id
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      post send_artist_proposal_route, artistproposal_params
      post logout_route
      post login_route, user
    }

    it 'fails if the user does not own the proposal nor the call and is not an admin' do
      post logout_route
      post login_route, other_user
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('you_dont_have_permission')
    end

    it 'fails if the proposal does not exist' do
      artistproposal_params[:id] = 'otter'
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2216, 05, 01))
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2216, 05, 01))
      post logout_route
      post login_route, admin_user
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
    end

    it 'modifies the artist proposal if call organizer' do
      artistproposal_params[:title] = 'otter_title'
      artistproposal[:title] = 'otter_title'
      artist_model[:proposals].first[:title] = 'otter_title'
      artist_model[:profile_id] = call_participant_profile_id
      artistproposal[:profile_id] = call_participant_profile_id
      artist_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      expect(Repos::Artistproposals).to receive(:modify).with(artistproposal.except(:register_date, :user_id, :selected)).and_call_original
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_model))
    end


    it 'modifies the artist proposal if admin' do
      post logout_route
      post login_route, admin_user
      artistproposal_params[:title] = 'otter_title'
      artistproposal[:title] = 'otter_title'
      artist_model[:proposals].first[:title] = 'otter_title'
      artist_model[:profile_id] = call_participant_profile_id
      artistproposal[:profile_id] = call_participant_profile_id
      artist_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      expect(Repos::Artistproposals).to receive(:modify).with(artistproposal.except(:register_date, :user_id, :selected)).and_call_original
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_model))
    end

    it 'fails if participant' do
      post logout_route
      post login_route, call_participant_user
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('fail')
    end

    it 'modifies the artist proposal if participant whitelisted' do
      post logout_route
      post login_route, call_participant_user
      Repos::Calls.add_whitelist call_id, [{email: call_participant_user[:email]}]
      artistproposal_params[:title] = 'otter_title'
      artistproposal[:title] = 'otter_title'
      artist_model[:proposals].first[:title] = 'otter_title'
      artist_model[:profile_id] = call_participant_profile_id
      artistproposal[:profile_id] = call_participant_profile_id
      artist_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      expect(Repos::Artistproposals).to receive(:modify).with(artistproposal.except(:register_date, :user_id, :selected)).and_call_original
      post modify_artist_proposal_route, artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_model))
    end
  end


  describe 'Modify own artist proposal' do

  	before(:each){
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, user
    }

    it 'modifies own artist proposal' do
      Repos::Artistproposals.clear
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      post send_artist_proposal_route, own_artistproposal_params
      own_artistproposal_params[:name] = 'otter_name'
      artist_own_model[:name] = 'otter_name'
      own_artistproposal_params[:title] = 'otter_title'
      artist_own_model[:proposals].first[:title] = 'otter_title'
      own_artist_proposal[:title] = 'otter_title'
      own_artistproposal_params[:id] = proposal_id
      own_artistproposal_params[:profile_id] = proposal_id

      expect(Repos::Artistproposals).to receive(:modify).with(own_artist_proposal.except(:register_date, :selected, :user_id)).and_call_original
      post modify_artist_proposal_route, own_artistproposal_params

      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_own_model))
    end

     it 'modifies the participant of the proposal' do
      Repos::Artistproposals.clear
      MetaRepos::Participants.clear
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      post send_artist_proposal_route, own_artistproposal_params
      own_artistproposal_params[:name] = 'otter_name'
      artist_own_model[:name] = 'otter_name'
      own_artistproposal_params[:id] = proposal_id
      own_artistproposal_params[:profile_id] = proposal_id
      expect(MetaRepos::Participants).to receive(:modify).once.with(hash_including(name: 'otter_name')).and_call_original
      post modify_artist_proposal_route, own_artistproposal_params
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_own_model))
      expect(MetaRepos::Participants.all.count).to eq 1
      expect(MetaRepos::Participants.get_by_id(proposal_id)[:name]).to eq 'otter_name'
    end


    it 'modifies own artist proposal if admin' do
      post logout_route
      post login_route, admin_user
      Repos::Artistproposals.clear
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      allow(SecureRandom).to receive(:uuid).and_return(proposal_id)
      post send_artist_proposal_route, own_artistproposal_params
      own_artistproposal_params[:name] = 'otter_name'
      own_artistproposal_params[:title] = 'otter_title'
      own_artistproposal_params[:id] = proposal_id
      own_artistproposal_params[:profile_id] = proposal_id
      own_artist_proposal[:title] = 'otter_title'
      artist_own_model[:name] = 'otter_name'
      artist_own_model[:proposals].first[:title] = 'otter_title'

      expect(Repos::Artistproposals).to receive(:modify).with(own_artist_proposal.except(:register_date, :selected, :user_id)).and_call_original
      post modify_artist_proposal_route, own_artistproposal_params

      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq(Util.stringify_hash(artist_own_model))
    end

  end

 
  describe 'Delete_artist_proposal' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      post logout_route
      post login_route, call_participant_user
      artistproposal_params[:profile_id] = call_participant_profile_id
      artistproposal_params[:id] = proposal_id
      post send_artist_proposal_route, artistproposal_params
    }

    it 'fails if the proposal does not exist' do
      post delete_artist_proposal_route, {event_id: event_id, proposal_id: 'otter'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_proposal')
    end

    it 'fails if the user is out of time' do
      allow(Time).to receive(:now).and_return(Time.new(1980, 05, 01))
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('out_of_time_range')
    end

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2280, 05, 01))
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2280, 05, 01))
      post logout_route
      post login_route, admin_user
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'allows event owner to delete and delivers rejection mail' do
      moked_time = Time.new(2016, 05, 01)
      allow(Time).to receive(:now).and_return(moked_time)
      receiver[:last_login] = moked_time.to_i*1000
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      
      post logout_route
      post login_route, user
      expect(Repos::Artistproposals).to receive(:delete).with(proposal_id)
      expect(mailer).to receive(:deliver_mail_to).with(receiver, :rejected, {organizer: 'name', event_name: 'event_name', title: 'title'})
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({"profile_id"=>call_participant_profile_id, "proposal_id"=>proposal_id})
    end

    it 'allows admin to delete and NOT deliver rejection mail' do
      post logout_route
      post login_route, admin_user  
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      expect(Repos::Artistproposals).to receive(:delete).with(proposal_id)
      user[:email] = artist_model[:email]
      expect(mailer).not_to receive(:deliver_mail_to).with(receiver, :rejected, {organizer: 'name', event_name: 'otter_event_name', title: 'title'})
     post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({"profile_id"=>call_participant_profile_id, "proposal_id"=>proposal_id})
    end


    it 'allows proposal owner to delete and NOT deliver rejection mail' do
      allow(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg'])
      expect(Repos::Artistproposals).to receive(:delete).with(proposal_id)
      expect(mailer).not_to receive(:deliver_mail_to).with(user, :rejected, {organizer: 'name', event_name: 'otter_event_name', title: 'title'})
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')

    end

    it 'does not send rejection mail if event finished' do
      post logout_route
      post login_route, user
      expect(mailer).not_to receive(:deliver_mail_to).with(receiver, :rejected, {organizer: 'name', event_name: 'otter_event_name', title: 'title'})
      allow(Time).to receive(:now).and_call_original
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({"profile_id"=>call_participant_profile_id, "proposal_id"=>proposal_id})
      
    end

    it 'removes participant if it has no proposals' do
      expect(Repos::Calls.get_by_id(call[:id])[:participants]).to eq([call_participant_profile_id])
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Repos::Calls).to receive(:remove_participant).with(call_id, call_participant_profile_id).and_call_original
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Calls.get_by_id(call[:id])[:participants]).to eq([])

    end

     it 'for own-proposals, deletes participant from Repos::Participants if it has no proposals nor activities' do
      #Create the proposal and the participant
      post logout_route
      post login_route, admin_user
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      post send_artist_proposal_route, own_artistproposal_params
      participant_id = parsed_response['model']['profile_id']
      own_proposal_id = parsed_response['model']['proposals'][0]['proposal_id']
      participant_id.slice!("-own")
      #Check the existence of the participant in the MetaRepos::Participants
      expect(MetaRepos::Participants.exists?(participant_id)).to eq(true)
      expect(Repos::Calls.get_by_id(call[:id])[:participants]).to eq([call_participant_profile_id, participant_id])
      #Delete proposal and expect deletion of the participant from the MetaRepos
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Repos::Calls).to receive(:remove_participant).with(call_id, participant_id).and_call_original
      expect(MetaRepos::Participants).to receive(:delete).with(participant_id).and_call_original
      post delete_artist_proposal_route, {id:own_proposal_id , call_id: call_id, event_id: event_id}
      expect(MetaRepos::Participants.exists?(participant_id)).to eq(false)

    end


    it 'for own-proposals, does not delete participant if it has no proposals but it does have activities' do
      #Create the proposal, the participant and the activity
      post logout_route
      post login_route, admin_user
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      artist_own_model[:proposals].first[:register_date] = Time.new(2016, 05, 01).to_i*1000
      own_artist_proposal[:register_date] = Time.new(2016, 05, 01).to_i*1000
      post send_artist_proposal_route, own_artistproposal_params
      participant_id = parsed_response['model']['profile_id']
      own_proposal_id = parsed_response['model']['proposals'][0]['proposal_id']
      participant_id.slice!("-own")
      activity[:participant_id] = participant_id
      Repos::Activities.save activity
      Repos::Programs.add_participant program_id, participant_id
      #Check the existence of the participant in the MetaRepos::Participants
      expect(MetaRepos::Participants.exists?(participant_id)).to eq(true)
      expect(Repos::Calls.get_by_id(call[:id])[:participants]).to eq([call_participant_profile_id, participant_id])
      #Delete proposal and expect deletion of the participant from the MetaRepos
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Repos::Calls).to receive(:remove_participant).with(call_id, participant_id).and_call_original
      expect(MetaRepos::Participants).not_to receive(:delete)
      post delete_artist_proposal_route, {id:own_proposal_id , call_id: call_id, event_id: event_id}
      expect(MetaRepos::Participants.exists?(participant_id)).to eq(true)


    end

    it 'does not removes participant if it has more proposals' do
      allow(SecureRandom).to receive(:uuid).and_call_original
      artistproposal_params[:id] = otter_event_id
      post send_artist_proposal_route, artistproposal_params
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      expect(Repos::Calls).not_to receive(:remove_participant).with(call_id, call_participant_profile_id)
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'removes all the activities connected with the proposal and deleted the CachedEvent' do
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Repos::Activities).to receive(:delete).with(activity_id)
      expect(Repos::Programs).to receive(:remove_activity).with(program_id, activity_id)
      expect(CachedEvent).to receive(:delete).with(event_id)
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'removes the artist and the space from the program if they both do not have other activities' do
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Repos::Programs).to receive(:remove_participant).twice
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'removes only the artist from the program if the space have other activities' do
      Repos::Activities.save otter_activity 
      expect(Repos::Programs).to receive(:remove_participant).once.with(program_id, call_participant_profile_id)
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'deletes photos from numeric field' do
      post logout_route
      post login_route, user
      artistproposal_params[:'1'] = ['nph1.jpg', 'nph2.jpg']
      post modify_artist_proposal_route, artistproposal_params
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Services::Gallery).to receive(:compare_and_delete_unused_pictures).with(nil, {photos: ['nph1.jpg', 'nph2.jpg']})
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      
    end

    it 'deletes photos from numeric field if SummableInputs or LinkUploadPDF' do
      post logout_route
      post login_route, user
      artistproposal_params[:'3'] = {img: ['nph1.jpg'], link:'www.link.li'}
      artistproposal_params[:'4'] = {'0': ['nph2.jpg']}
      post modify_artist_proposal_route, artistproposal_params
      allow(Cloudinary::Api).to receive(:delete_resources)
      expect(Services::Gallery).to receive(:compare_and_delete_unused_pictures).with(nil, {photos: ['nph1.jpg', 'nph2.jpg']})
      post delete_artist_proposal_route, {id: proposal_id, call_id: call_id, event_id: event_id}
      
    end


  end

  describe 'Assets'do
    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)   
      post create_profile_route, profile
      allow(Time).to receive(:now).and_return(Time.new(2016, 05, 01))
      allow(mailer).to receive(:deliver_mail_to)
      MetaRepos::Assets.clear
      post logout_route
      post login_route, user
    }


    it 'creates a new asset if picture used in a artist proposal from an existing production' do
      artistproposal_params[:photos] = ['proposal_photos.jpg']
      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.all.length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'proposal_photos.jpg' ).first[:holders].length).to eq(1)

    end


    it 'creates a new asset if picture used in a artist proposal and add both production and proposal ids to holders' do
      artistproposal_params[:production_id] = nil
      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)        
      expect(MetaRepos::Assets.get(url: 'otter_picture.jpg' ).first[:holders].length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].length).to eq(2)
       production = Repos::Productions.get_profile_productions(profile_id).first
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].include?(production[:id])).to eq(true)

    end



    it 'is not deleted if proposal is deleted but production not' do
      artistproposal_params[:production_id] = nil
      artistproposal_params[:id] = proposal_id
      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].include?(proposal_id)).to eq(true)
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].length).to eq(2)
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      post delete_artist_proposal_route,  {id: proposal_id, call_id: call_id, event_id: event_id}
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'otter_picture.jpg' ).first[:holders].length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].length).to eq(1)
      expect(MetaRepos::Assets.get(url: 'picture.jpg' ).first[:holders].include?(proposal_id)).to eq(false)
    end

    it 'is deleted if both proposal and production deleted' do
      # proposal[:production_id] = nil
      artistproposal_params[:id] = proposal_id
      post send_artist_proposal_route, artistproposal_params
      expect(Cloudinary::Api).to receive(:delete_resources).with(['picture.jpg', 'otter_picture.jpg']).exactly(1).times 
      post delete_artist_proposal_route,  {id: proposal_id, call_id: call_id, event_id: event_id}
      production = Repos::Productions.get_profile_productions(profile_id).first
      post delete_production_route, production

      expect(MetaRepos::Assets.all.length).to eq(0)
      # 
    end


    it 'get a new holder for each new proposal sent' do
      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'picture.jpg').first[:holders].length).to eq(1)


      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.all.length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'picture.jpg').first[:holders].length).to eq(2)

      artistproposal_params[:photos] = ['picture.jpg', 'new_picture.jpg']
      post send_artist_proposal_route, artistproposal_params
      expect(MetaRepos::Assets.all.length).to eq(3)
      expect(MetaRepos::Assets.get(url: 'picture.jpg').first[:holders].length).to eq(3)
      expect(MetaRepos::Assets.get(url: 'otter_picture.jpg').first[:holders].length).to eq(2)
      expect(MetaRepos::Assets.get(url: 'new_picture.jpg').first[:holders].length).to eq(1)

    end

  end

  describe 'Select / Deselect proposal' do

    before(:each){
      allow(Cloudinary::Api).to receive(:delete_resources)
      post logout_route
      post login_route, user
      Repos::Artistproposals.save artistproposal
    }

    it 'fails if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2280, 05, 01))
      post select_deselect_artist_route, {id: proposal_id, event_id: event_id, call_id:call_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('past_event')
    end


    it 'does not fail for amin if the event is past' do
      allow(Time).to receive(:now).and_return(Time.new(2280, 05, 01))
      post logout_route
      post login_route, admin_user
      post select_deselect_artist_route, {id: proposal_id, event_id: event_id, call_id:call_id}
      expect(parsed_response['status']).to eq('success')
    end

    it 'deselect/select proposal' do
      post select_deselect_artist_route, {id: proposal_id, event_id: event_id, call_id:call_id}
      saved_proposal = Repos::Artistproposals.get_by_id proposal_id
      expect(saved_proposal[:selected]).to eq false
      post select_deselect_artist_route, {id: proposal_id, event_id: event_id, call_id:call_id}
      saved_proposal = Repos::Artistproposals.get_by_id proposal_id
      expect(saved_proposal[:selected]).to eq true
    end
  end


  describe 'Modify param' do

    before(:each){
      post logout_route
      post login_route, user
      Repos::Artistproposals.save artistproposal
    }

    it 'modifies param proposal' do
      expect(Actions::UpdateDbElement).to receive(:run).once.and_call_original
      post modify_param_proposal_route, {id: proposal_id, event_id: event_id, call_id:call_id, profile_id: profile_id, param: 'new_param', value: 'new_value', type: 'artist'}
      saved_proposal = Repos::Artistproposals.get_by_id proposal_id
      expect(saved_proposal[:new_param]).to eq 'new_value'
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['model']).to eq({'proposal_id'=> proposal_id, 'profile_id'=> profile_id, 'param'=>'new_param', 'value'=> 'new_value', 'type'=>'artist'})
    end
  end


end