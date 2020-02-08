describe 'Services::Search Spaces' do
  
  let(:profile_id){'aaabcc94-4a2b-49ff-b6b6-dfd53e45bb83'}
  
  let(:space_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_space_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb84'}
  let(:other_space_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb85'}
  let(:o_space_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb86'}

  let(:tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb87'}
  let(:otter_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb88'}
  let(:other_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb89'}
  let(:o_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb00'}

  let(:space_name){'space name'}
  let(:otter_space_name){'otter name'}
  let(:other_space_name){'other space name'}
  let(:o_space_name){'o_space_name'}


  let(:profile){
    {
      id: profile_id,
      name: 'profile_name',
      color: 'profile_color',
      address: {:postal_code => '46020', :locality => 'city'}
    }
  }

 

  let(:space){
    {
      profile_id: profile_id,
      id: space_id,
      type: 'space_type',
      address: 'space_address',
      main_picture: ['picture.jpg'],  
      name: space_name
    }
  }

  let(:otter_space){
    {
      profile_id: profile_id,
      id: otter_space_id,
      type: 'otter_space_type',
      address: 'otter_space_address',
      main_picture: [],  
      name: otter_space_name
    }
  }

  let(:other_space){
    {
      profile_id: profile_id,
      id: other_space_id,
      ftype: 'other_space_type',
      address: 'other_space_address',
      main_picture: '',  
      name: other_space_name
    }
  }

  let(:o_space){
    {
      profile_id: profile_id,
      id: o_space_id,
      type: 'o_space_type',
      address: 'o_space_address',
      main_picture: ['o_picture.jpg'],  
      name: o_space_name
    }
  }

  let(:intit_pull_params){
    {
      first_half_results: true
    }
  }

  let(:db_key){'spaces'} 

  describe 'get_results for spaces' do

    let(:sample_size){15}   


    
    before(:each){
      (sample_size).times do
        new_space = otter_space.deep_dup
        new_space[:id] = SecureRandom.uuid
        Repos::Spaces.save(new_space)
      end
       (sample_size).times do
        new_space = space.deep_dup
        new_space[:id] = SecureRandom.uuid
        Repos::Spaces.save(new_space)
      end
      (sample_size).times do
        new_space = other_space.deep_dup
        new_space[:id] = SecureRandom.uuid
        Repos::Spaces.save(new_space)
      end
    }

    before(:each){
      Repos::Profiles.class_variable_get(:@@collection).insert_one(profile)
      Repos::Spaces.class_variable_get(:@@collection).insert_many([space, otter_space, other_space, o_space])
    }


    it 'returns sample_size spaces, the db_position and the first_half_results paramater' do

      spaces, pull_params = Services::Search.get_results(intit_pull_params, db_key)

      expect(spaces.count).to eq sample_size
      expect(pull_params[:first_half_results]).to eq true
    end

    it 'returns spaces whose elements are all different ' do

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      results_2, pull_params = Services::Search.get_results(pull_params, db_key)
      results_3, pull_params = Services::Search.get_results(pull_params, db_key)
      results_4, pull_params = Services::Search.get_results(pull_params, db_key)
      results_5, pull_params = Services::Search.get_results(pull_params, db_key)

      expect(results_1.size).to eq sample_size
      expect(results_2.size).to eq sample_size
      expect(results_1 - results_2).to eq(results_1)
      expect(results_3.size).to eq sample_size
      expect(results_3 - results_1 - results_2).to eq(results_3)    
      expect(results_4.size).to eq 4
      expect(results_4 - results_3 - results_1 - results_2).to eq(results_4)
      expect(results_5.size).to eq 0

    end

    it 'returns spaces with main_picture if first_half_results is true' do
      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.any?{|prof| prof[:main_picture].blank?}).to eq false
    end

    it 'returns spaces without main_picture if first_half_results false' do
      intit_pull_params[:first_half_results] = false

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.all?{|prof| prof[:main_picture].blank?}).to eq true
    end
  
  end


end