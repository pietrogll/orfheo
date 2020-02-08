describe FormsController do

  include_examples 'http_methods'
  include_examples 'ids'  
  include_examples 'db_elements'  

  
  let(:forms){
    {
      texts: 'call_texts',
      artist:{
        form_id => {
            'blocks' => artist_blocks[:es],
            'texts' => {label: 'label'},
            "type"=>"artist", 
            "form_id"=> form_id,
            "widgets" => {} 
          },
        "form_id_2" => {
            'blocks' => artist_blocks[:es],
            'texts' => 'texts',
            "type"=>"artist", 
            "form_id"=> "form_id_2",
            "widgets" => {'wk' => 'wv'} 
          }
      },
      space:{
        "form_id_3" => {
            'blocks' => space_block[:es],
            'texts' => 'texts',
            "type"=>"space", 
            "form_id"=>"form_id_3",
            "widgets" => {}
          },
        "form_id_4" => {
            'blocks' => space_block[:es],
            'texts' => 'texts',
            "type"=>"space", 
            "form_id"=>"form_id_4",
            "widgets" => {}
          }
      }
    }
  }

  let(:call){
    {
      id: call_id,
      user_id: user_id,
      texts: {es: 'call_texts'},
      forms: [form_id, 'form_id_2', 'form_id_3', 'form_id_4']
    }
  }

  let(:artist_blocks){
    {
      es:{
        title: {type: "mandatory"},
        format: {type: "mandatory"},
        description: {type: "mandatory"},
        short_description: {type: "mandatory"},
        duration: {type: "mandatory"},
        '1': {type: "optional", input:'UploadPhotos'},
        '2': {type: "mandatory", input: 'Input'},
        '3':{type: "optional", input: "LinkUploadPDF"},
        '4':{type:"optional", input: "SummableInputs", args:[{'0':{type: "optional", input:"UploadPDF"}}]},
        category: {type:'mandatory'},
        subcategory: {type: "mandatory"},
        photos: {type: "optional"},
        children: {type: "mandatory"}
      }
    }
  }

  let(:space_block){
    {
      es:{
          subcategory: {type: 'mandatory'},
          '1': {type: "optional"},
          '2': {type: "mandatory"},
          ambient_info:{
            capacity:{type:"mandatory"}
          }
      }
    }
  }

  let(:artist_form_1){
    {
      id: form_id,
      call_id: call_id,
      user_id: user_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: {label: 'label'}
      },
      own: 'own'
    }
  }


  let(:artist_form_2){
    {
      id: 'form_id_2',
      call_id: call_id,
      user_id: user_id,
      type: 'artist',
      blocks: artist_blocks,
      texts:{
        es: 'texts'
      },
      widgets: {es:{wk: 'wv'}}
    }
  }


  let(:space_form_1){
    {
      id: 'form_id_3',
      call_id: call_id,
      user_id: user_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      }
    }
  }

  let(:space_form_2){
    {
      id: 'form_id_4',
      call_id: call_id,
      user_id: user_id,
      type: 'space',
      blocks: space_block,
      texts:{
        es: 'texts'
      },
      own:'private'
    }
  }


  before(:each){
    Repos::Users.save user
    Repos::Users.save admin_user
    Repos::Users.save other_user
    MetaRepos::Admins.save admin
    Repos::Calls.save(call)
    allow(Services::Encryptor).to receive(:check_equality).and_return(true)
    post logout_route
  }

  describe 'Create' do

    it 'fails if call not exist' do
      post login_route, other_user
      artist_form_1.delete :id
      artist_form_1[:call_id] = 'otter_call_id'
      post create_form_route, artist_form_1
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end
    
    it 'fails if not admin nor call owner' do
      post login_route, other_user
      artist_form_1.delete :id
      post create_form_route, artist_form_1
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('call_ownership')
    end

    it 'adds form_id to corresponding call' do
      post login_route, other_user
      artist_form_1.delete :id
      post create_form_route, artist_form_1
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('call_ownership')
    end
    
    it 'creates a form if admin' do
      post login_route, admin_user
      artist_form_1.delete :id
      expect(Repos::Forms).to receive(:save).and_call_original
      post create_form_route, artist_form_1
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['form']).to include(Util.stringify_hash(artist_form_1))
    end

    it 'creates a form if call owner' do
      post login_route, user
      artist_form_1.delete :id
      expect(Repos::Forms).to receive(:save)
      post create_form_route, artist_form_1
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['form']).to include(Util.stringify_hash(artist_form_1))
    end


     it 'adds form_id to corresponding call[:forms]' do
      post login_route, user
      expect(Repos::Calls).to receive(:add_form).and_call_original
      post create_form_route, artist_form_1
      expect(Repos::Calls.get_forms(call_id)).to include(form_id)
    end


    
  end

  describe 'Modify' do

    before(:each){
      Repos::Forms.save artist_form_1
    }


    it 'fails if the form does not exist' do
      post login_route, other_user
      artist_form_1[:id] = 'otter_id'
      post modify_form_route, artist_form_1
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_form')
    end


    it 'fails if not the form owner nor the admin' do
      post login_route, other_user
      post modify_form_route, artist_form_1
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('form_ownership')
    end


    it 'modifies the form' do
      post login_route, user
      artist_form_1[:texts] = {es: {label: 'new_label', part_one: 'part_one'}}
      post modify_form_route, artist_form_1
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['form']['texts']['es']['label']).to eq('new_label')
    end


  end


  describe 'Delete' do
    before(:each){
      Repos::Forms.save artist_form_1
    }

    it 'fails if the form does not exist' do
      post login_route, admin_user
      post delete_form_route, {id: 'otter_id'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_form')
    end


    it 'fails if not the form owner nor the admin' do
      post login_route, other_user
      post delete_form_route, {id: form_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('form_ownership')
    end


    it 'fails if form has proposals' do
      Repos::Artistproposals.save({form_id: form_id})
      post login_route, admin_user
      post delete_form_route, {id: form_id}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('form_has_proposals')
    end

    it 'deletes the form' do
      post login_route, admin_user
      post delete_form_route, {id: form_id}
      expect(parsed_response['status']).to eq('success')
      expect(Repos::Forms.get_by_id form_id).to eq(nil)
    end

    it 'remove the form_id from corresponding call' do
      expect(Repos::Calls.get_by_id(call_id)[:forms]).to include(form_id)
      post login_route, admin_user
      expect(Repos::Calls).to receive(:remove_form).once.and_call_original
      post delete_form_route, {id: form_id}
      expect(Repos::Calls.get_by_id(call_id)[:forms]).not_to include(form_id)
    end


  end


  describe 'Get' do

    before(:each){
      Repos::Forms.save artist_form_1
      Repos::Forms.save artist_form_2
      Repos::Forms.save space_form_1
      Repos::Forms.save space_form_2
    }

    it 'fails if the call does not exist' do
      post forms_route, {}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('non_existing_call')
    end

    it 'retrieves the forms but not the own and the private' do
      expect(Repos::Forms).to receive(:get).with({call_id: call_id}).once.and_call_original
      post forms_route, {call_id: call_id}
      expect(parsed_response['status']).to eq('success')
      forms[:artist].delete(form_id)
      forms[:space].delete('form_id_4')
      expect(parsed_response['forms']).to eq(Util.stringify_hash(forms))
    end

    it 'retrieves the forms private if user whitelisted' do
      other_user[:lang] = 'es'
      post login_route, other_user
      Repos::Calls.add_whitelist(call_id, [ 
        {
            "name_email" => "user_em",
            "email" => 'other@other.com'
        }])
      expect(Repos::Forms).to receive(:get).with({call_id: call_id}).once.and_call_original
      post forms_route, {call_id: call_id}
      expect(parsed_response['status']).to eq('success')
      forms[:artist].delete(form_id)
      expect(parsed_response['forms']).to eq(Util.stringify_hash(forms))
    end


    it 'retrieves all the forms if user is event owner ' do
      post login_route, user
      expect(Repos::Forms).to receive(:get).with({call_id: call_id}).once.and_call_original
      post forms_route, {call_id: call_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['forms']).to eq(Util.stringify_hash(forms))

    end

    it 'retrieves all the forms if admin ' do
      post login_route, admin_user
      expect(Repos::Forms).to receive(:get).with({call_id: call_id}).once.and_call_original
      post forms_route, {call_id: call_id}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['forms']).to eq(Util.stringify_hash(forms))

    end


  end
end