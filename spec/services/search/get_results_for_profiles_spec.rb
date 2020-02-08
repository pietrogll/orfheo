describe 'Services::Search Profiles' do
  
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb84'}
  let(:other_profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb85'}
  let(:o_profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb86'}

  let(:tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb87'}
  let(:otter_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb88'}
  let(:other_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb89'}
  let(:o_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb00'}

  let(:profile_name){'profile name'}
  let(:otter_profile_name){'otter name'}
  let(:other_profile_name){'other profile name'}
  let(:o_profile_name){'o_profile_name'}


  let(:profile){
    {
      id: profile_id,
      facets: [ 'artist', 'creative', 'manager'],
      name: profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id],
      profile_picture: ['profile_picture.jpg']
      # description: nil,
      # short_description: nil,
      # color: 'color'
    }
  }

  let(:otter_profile){
    {
      id: otter_profile_id,
      facets: [ 'manager', 'business'],
      name: otter_profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id, otter_tag_id],
      profile_picture: ''
    }
  }

  let(:other_profile){
    {
      id: other_profile_id,
      facets: [ 'collective', 'artist' ],
      name: other_profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id, otter_tag_id, other_tag_id],
      profile_picture: ""
    }
  }

  let(:o_profile){
    {
      id: o_profile_id,
      facets: ['artist'],
      name: o_profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id, otter_tag_id, o_tag_id],
      profile_picture: nil
    }
  }

  before(:each){
    Repos::Profiles.class_variable_get(:@@collection).insert_many([profile, otter_profile, other_profile, o_profile])
  }

  let(:intit_pull_params){
    {
      first_half_results: true
    }
  }

  let(:db_key){'profiles'} 

  describe 'get_results for profiles' do

    let(:sample_size){15}   


    
    before(:each){
      (sample_size).times do
        new_profile = otter_profile.deep_dup
        new_profile[:id] = SecureRandom.uuid
        Repos::Profiles.save(new_profile)
      end
       (sample_size).times do
        new_profile = profile.deep_dup
        new_profile[:id] = SecureRandom.uuid
        Repos::Profiles.save(new_profile)
      end
      (sample_size).times do
        new_profile = other_profile.deep_dup
        new_profile[:id] = SecureRandom.uuid
        Repos::Profiles.save(new_profile)
      end
    }


    it 'returns sample_size results, the db_position and the first_half_results paramater' do

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)

      expect(results.count).to eq sample_size
      expect(pull_params[:first_half_results]).to eq true
    end

    it 'returns results whose elements are all different ' do

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


    it 'returns profiles with profile_picture if first_half_results is true' do
      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.any?{|prof| prof[:profile_picture].blank?}).to eq false
    end

    it 'returns profiles without profile_picture if first_half_results false' do
      intit_pull_params[:first_half_results] = false

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.all?{|prof| prof[:profile_picture].blank?}).to eq true
    end
  
  end

  
  describe 'get profile by words in the name' do

    let(:profile_collection){Repos::Profiles.class_variable_get(:@@collection)}

    before(:each){
      profile_collection.indexes.create_one( { :name => 'text' }, { default_language: "none" } )
    }
    after(:each){
      profile_collection.indexes.drop_all
    }

    context 'when the order is only first_half_results and does not care about textScore' do

    
      it 'returns the profiles with the name including the queried word' do
        query = {'$text': {'$search': "\"profile name\""}}

        results, pull_params = Services::Search.get_results(intit_pull_params, db_key, query)
        
        results_names = results.map{|result| result[:name]}.sort
        expected_names = [profile_name, other_profile_name].sort
        expect(results_names).to eq(expected_names)
      end

      it 'returns the profiles with the name without caring about case' do
        query = {'$text': {'$search': "\"other\""}}

        results, pull_params = Services::Search.get_results(intit_pull_params, db_key, query)

        results_names = results.map{|result| result[:name]}.sort
        expected_names = [other_profile_name].sort
        expect(results_names).to eq(expected_names)
      end

      it 'returns the profiles with the name without caring about accents' do
        query = {'$text': {'$search': "\"náme\""}}

        results, pull_params = Services::Search.get_results(intit_pull_params, db_key, query)

        results_names = results.map{|result| result[:name]}.sort
        expected_names = [profile_name, otter_profile_name, other_profile_name].sort
        expect(results_names).to eq(expected_names)
      end

      it 'returns the profiles with the name without caring about case nor accents' do
        query = {'$text': {'$search': "\"pRofilé nÀme\""}}

        results, pull_params = Services::Search.get_results(intit_pull_params, db_key, query)
        
        results_names = results.map{|result| result[:name]}.sort
        expected_names = [profile_name, other_profile_name].sort
        expect(results_names).to eq(expected_names)
      end

    end

  end



end