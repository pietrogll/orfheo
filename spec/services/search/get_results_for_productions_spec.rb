require_relative '../../../lib/storage'

describe 'Services::Search Productions' do
  
  let(:profile_id){'ccc01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  
  let(:production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb84'}
  let(:other_production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb85'}
  let(:o_production_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb86'}

  let(:tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb87'}
  let(:otter_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb88'}
  let(:other_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb89'}
  let(:o_tag_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb00'}

  let(:production_title){'production title'}
  let(:otter_production_title){'otter title'}
  let(:other_production_title){'other production title'}
  let(:o_production_title){'o_production_title'}


  let(:profile){
    {
      id: profile_id,
      name: 'profile_name',
      color: 'profile_color',
      address: {:postal_code => '46020', :locality => 'city'}
    }
  }

 

  let(:production){
    {
      profile_id: profile_id,
      id: production_id,
      format: 'show',
      category: 'music',
      main_picture: ['picture.jpg'],  
      tags: [tag_id, otter_tag_id],
      title: production_title,      
      duration: 'duration',
      children: 'children',
      cache: 'cache'
    }
  }

  let(:otter_production){
    {
      profile_id: profile_id,
      id: otter_production_id,
      format: 'concert',
      category: 'music',
      main_picture: [],  
      tags: [otter_tag_id],
      title: otter_production_title,
      duration: 'duration',
      children: 'children',
      cache: 'cache'
    }
  }

  let(:other_production){
    {
      profile_id: profile_id,
      id: other_production_id,
      format: 'show',
      category: 'arts',
      main_picture: '',  
      tags: nil,
      title: other_production_title,
      duration: 'duration',
      children: 'children',
      cache: 'cache'
    }
  }

  let(:o_production){
    {
      profile_id: profile_id,
      id: o_production_id,
      format: 'workshop',
      category: 'visual',
      main_picture: ['o_picture.jpg'],  
      tags: [o_tag_id],
      title: o_production_title,
      duration: 'duration',
      children: 'children',
      cache: 'cache'
    }
  }

  before(:each){
    Repos::Profiles.class_variable_get(:@@collection).insert_one(profile)
    Repos::Productions.class_variable_get(:@@collection).insert_many([production, otter_production, other_production, o_production])
  }


  describe 'get_results for productions' do

    SAMPLE_PRODUCTIONS_SIZE = 15   
    PRODUCTIONCARD_WANTED_PARAMS = [:id, :title, :format, :category, :tags, :main_picture, :profile_id, :children, :cache, :duration, :profile_name, :profile_color]


    let(:intit_pull_params){
      {
        first_half_results: true
      }
    }

    let(:db_key){'productions'}        
    
    before(:each){
      (SAMPLE_PRODUCTIONS_SIZE).times do
        new_production = production.deep_dup
        new_production[:id] = SecureRandom.uuid
        Repos::Productions.save(new_production)
      end
       (SAMPLE_PRODUCTIONS_SIZE).times do
        new_production = otter_production.deep_dup
        new_production[:id] = SecureRandom.uuid
        Repos::Productions.save(new_production)
      end
      (SAMPLE_PRODUCTIONS_SIZE).times do
        new_production = other_production.deep_dup
        new_production[:id] = SecureRandom.uuid
        Repos::Productions.save(new_production)
      end
    }


    it 'returns SAMPLE_PRODUCTIONS_SIZE results, the db_position and the first_half_results paramater' do

      results, pull_params = Services::Search.get_results(intit_pull_params, db_key)

      expect(results.count).to eq SAMPLE_PRODUCTIONS_SIZE
      expect(pull_params[:first_half_results]).to eq true
    end

    it 'returns results whose elements are all different ' do

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      results_2, pull_params = Services::Search.get_results(pull_params, db_key)
      results_3, pull_params = Services::Search.get_results(pull_params, db_key)
      results_4, pull_params = Services::Search.get_results(pull_params, db_key)
      results_5, pull_params = Services::Search.get_results(pull_params, db_key)

      expect(results_1.size).to eq SAMPLE_PRODUCTIONS_SIZE
      expect(results_2.size).to eq SAMPLE_PRODUCTIONS_SIZE
      expect(results_1 - results_2).to eq(results_1)
      expect(results_3.size).to eq SAMPLE_PRODUCTIONS_SIZE
      expect(results_3 - results_1 - results_2).to eq(results_3)    
      expect(results_4.size).to eq 4
      expect(results_4 - results_3 - results_1 - results_2).to eq(results_4)
      expect(results_5.size).to eq 0

    end


    it 'returns production with main_picture if first_half_results is true' do
      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.any?{|prod| prod[:main_picture].blank?}).to eq false
    end

    it 'returns productions without main_picture if first_half_results false' do
      intit_pull_params[:first_half_results] = false

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      
      expect(results_1.all?{|prof| prof[:main_picture].blank?}).to eq true
    end

    it 'returns PRODUCTIONCARD_WANTED_PARAMS' do
      intit_pull_params[:first_half_results] = false

      results_1, pull_params = Services::Search.get_results(intit_pull_params, db_key)
      a_production = results_1[0]

      expect(a_production.keys.sort).to eq PRODUCTIONCARD_WANTED_PARAMS.sort
      expect(a_production[:profile_name]).to eq 'profile_name'
      expect(a_production[:profile_color]).to eq 'profile_color'
    end
  
  end


end