describe SearchController do

  let(:login_route){'/login/login'}
  let(:logout_route){'/login/logout'}
  let(:suggest_route){'/search/suggest'}
  let(:results_route){'/search/results'}
  let(:load_results_route){'/search/load_results'}
  let(:suggest_tag_route){'/search/suggest_tags'}
  let(:suggest_program_tag_route){'/search/suggest_program'}


  let(:user_id){'5c41cf77-32b0-4df2-9376-0960e64a654a'}
  let(:validation_code){'3c61cf77-32b0-4df2-9376-0960e64a654a'}
  let(:profile_id){'fce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:production_id){'b11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:otter_profile_id){'cce01c94-4a2b-49ff-b6b6-dfd53e45bb83'}
  let(:otter_production_id){'c11000e7-8f02-4542-a1c9-7f7aa18752ce'}
  let(:event_id){'233300e7-8f02-4542-a1c9-7f7aa18752ce'}


  let(:user){
    {
      id: user_id,
      email: 'email@test.com',
      password: 'password',
      lang: 'es',
      validation: false,
      validation_code: validation_code
    }
  }


  let(:user_hash){
    {
      email: 'email@test.com',
      password: 'password'
    }
  }

  let(:profile){
    {
      user_id: user_id,
      id: profile_id,
      facets: ['other-facet'],
      tags: nil,
      name: 'name',
      email: {:visible => 'false', :value => "email@test.com"},
      profile_picture: ['otter_profile_picture.jpg'],
      address: {:postal_code => '46020', :locality => 'city'},
      description: nil,
      short_description: 'description',
      personal_web: nil,
      color: 'color',
      phone:  { :visible => 'false', :value => 'phone'},
      buttons: [{:text => 'text_button', :links => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []

    }
  }

  let(:otter_profile){
    {
      user_id: user_id,
      id: otter_profile_id,
      facets: ['facet'],
      tags: nil,
      name: 'otter_name',
      email: {:visible => 'false', :value => "otter@test.com"},
      profile_picture: nil,
      address: {:postal_code => '46020', :locality => 'city'},
      description: 'description',
      short_description: nil,
      personal_web: nil,
      color: 'color',
      phone:  { :visible => 'false', :value => 'phone'},
      buttons: [{:text => 'text_button', :links => 'link_button'}],
      menu: [
        "free_block",
        "upcoming",
        "space",
        "description",
        "portfolio",
        "history"
        ],
      relations: []

    }
  }


  let(:production){
    {
      profile_id: profile_id,
      id: production_id,
      format: 'concert',
      category: 'music',
      main_picture: ['picture.jpg'],  
      title: 'title',
      tags: nil,
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: nil,
      children: nil,
      cache: {:value=>nil, :visible=>false, :comment=>nil}
    }
  }


  let(:otter_production){
    {
      profile_id: profile_id,
      id: otter_production_id,
      format: 'show',
      category: 'poetry',
      main_picture: ['otter_picture.jpg'],  
      title: 'title',
      tags: nil,
      description: 'description',
      short_description: 'short_description',
      duration: 'duration',
      photos: ['picture.jpg', 'otter_picture.jpg'],
      links: [{link: 'web', web_title: 'web_name'},{link: 'otter_web', web_title: 'otter_web_name'}],
      children: 'children',
      cache: {:value=>nil, :visible=>false, :comment=>nil}
    }
  }



  before(:each){
    Repos::Users.save user
    Repos::Users.validate validation_code
    # Repos::Events.save event
    allow(Repos::Profiles).to receive(:all).and_return([profile, otter_profile])
  }

  describe 'Suggest' do

    it 'returns empty array if last query is empty' do
      post suggest_route, {query: ['valencia', ''], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([])
    end

    it 'fails if a non-empty query is not an array of strings' do
      post suggest_route, {query: [{id: 'id'}], lang: 'es'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_query')
    end

    it 'suggests names and facets of profiles' do
      post suggest_route, {query: ['city', 'o'], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([
        {
          "id" => "other-facet",
          "text"=>"other-facet",
          "type"=>"facet",
          "icon"=>"other-facet"
        },
        {
          "id"=>"otter_name",
          "text"=>"otter_name",
          "type"=>"name",
          "icon"=>"otter_name"
        }
      ])
    end

    xit 'allows query from production fields' do
      post suggest_route, {query: ['music', 'tit'], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([
        {
          "id"=>"title",
          "text"=>"title",
          "type"=>"title",
          "icon"=>"title"
        }
      ])
    end

    it 'does not suggest already queried elements' do
      post suggest_route, {query: ['ci'], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([{
        "id"=>"city",
        "text"=>"city",
        "type"=>"city",
        "icon"=>"city"
      }])
    end
  end

  describe 'Results' do

    it 'fails if the query is not an array of strings' do
      post results_route, {query: {id: 'id'}, lang: 'es'}
      expect(parsed_response['status']).to eq('fail')
      expect(parsed_response['reason']).to eq('invalid_query')
    end

    it 'returns random shuffled profiles if query is empty' do
      post results_route, {query: [], shown: [], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profiles']).to include Util.stringify_hash(profile) 
      expect(parsed_response['profiles']).to include Util.stringify_hash(otter_profile)
    end

    it 'returns matching profiles' do
      post results_route, {query: ['other-facet'], shown: [], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profiles']).to eq([Util.stringify_hash(profile)])
    end

    it 'excludes already shown profiles' do
      post results_route, {query: ['city'], shown: [profile_id], lang: 'es'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['profiles'].length).to eq(1)
      expect(parsed_response['profiles']).to eq([Util.stringify_hash(otter_profile)])
    end
  end


  describe 'load_results' do

    let(:num_profiles_returned){15}
    let(:pull_params_keys){['n_pulled', 'n_total', 'db_position', 'first_half_results', 'n_results', 'starting_db_position' ]}
    let(:intit_pull_params){
      {
        first_half_results: true
      }
    }
    let(:db_key){'profiles'}

    context 'when looking for profiles' do

      let(:params){
        {
          pull_params: intit_pull_params,
          db_key: db_key
        }
      }


      it 'returns num_profiles_returned profiles and updated pull_params' do
        (num_profiles_returned*2).times do
          new_profile = profile.deep_dup
          new_profile[:id] = SecureRandom.uuid
          Repos::Profiles.save(new_profile)
        end
        num_profiles_returned.times do
          new_profile = otter_profile.deep_dup
          new_profile[:id] = SecureRandom.uuid
          Repos::Profiles.save(new_profile)
        end

        post load_results_route, params
        
        expect(parsed_response['status']).to eq('success')

        expect(parsed_response['profiles'].count).to eq num_profiles_returned

        expect(parsed_response['pull_params'].keys.sort).to eq(pull_params_keys.sort)
        expect(parsed_response['pull_params']['n_total']).to eq(3*num_profiles_returned)
        expect(parsed_response['pull_params']['n_results']).to eq(2*num_profiles_returned)
        expect(parsed_response['pull_params']['n_pulled']).to eq(num_profiles_returned)
        expect(parsed_response['pull_params']['first_half_results']).to eq 'true'
      end


      it 'excludes already shown profiles' do
        (num_profiles_returned*1).times do
          new_profile = profile.deep_dup
          new_profile[:id] = SecureRandom.uuid
          Repos::Profiles.save(new_profile)
        end
        Repos::Profiles.save(profile)
        Repos::Profiles.save(otter_profile)

        post load_results_route, params
        ids_request_1 = parsed_response['profiles'].map{|profile| profile['id']}
        params_request_2 =  {pull_params: parsed_response['pull_params'], db_key: db_key}
        post load_results_route, params_request_2
        ids_request_2 = parsed_response['profiles'].map{|profile| profile['id']}

        expect(ids_request_1.any?{|profile_id| ids_request_2.include?(profile_id)}).to eq false


      end

       it 'pulls all profiles according to the query and at the end return always empty array' do
        (num_profiles_returned*1).times do
          new_profile = profile.deep_dup
          new_profile[:id] = SecureRandom.uuid
          Repos::Profiles.save(new_profile)
        end
        Repos::Profiles.save(profile)
        Repos::Profiles.save(otter_profile)

        post load_results_route, params
        results_1 = parsed_response['profiles']
        params_request_2 =  {pull_params: parsed_response['pull_params'], db_key: db_key}
        post load_results_route, params_request_2
        results_2 = parsed_response['profiles']
        params_request_3 =  {pull_params: parsed_response['pull_params'], db_key: db_key}
        post load_results_route, params_request_3
        results_3 = parsed_response['profiles']

        expect(results_1.length).to eq num_profiles_returned
        expect(results_2.length).to eq 2
        expect(results_3).to eq []
        
      end
    end

    context 'when looking for profiles by name' do
      let(:query){{name: 'name'}}
      let(:params){
        {
          pull_params: intit_pull_params,
          db_key: db_key,
          query: query
        }
      }

      let(:profile_collection){Repos::Profiles.class_variable_get(:@@collection)}

      after(:each){
        profile_collection.indexes.drop_all
      }


      before(:each) do 
        Repos::Profiles.save profile
        Repos::Profiles.save otter_profile
        profile_collection.indexes.create_one( { :name => 'text' }, { default_language: "es" } )
      end

      it 'returns an array of profiles with the specified name and the pull_params' do
        expected_pull_params = {
          "db_position" => 1,
          "n_pulled" => 1,
          "n_results" => 1,
          "n_total" => 1,
          "first_half_results" => "true",
          "starting_db_position" => 0
        }
        expected_result_length =  1
        expected_result_name = 'name'
        
        post load_results_route, params
        results = parsed_response['profiles']
        pull_params = parsed_response['pull_params']

        expect(results.length).to eq(expected_result_length)
        expect(results.first['name']).to eq(expected_result_name)
        expect(pull_params).to eq (expected_pull_params)
      end

      it 'returns empty array and pull_params if all profiles with the specified name have already been loaded' do

        post load_results_route, params
        results_1 = parsed_response['profiles']
        params_request_2 =  {pull_params: parsed_response['pull_params'], db_key: db_key, query: query}
        post load_results_route, params_request_2
        results_2 = parsed_response['profiles']

        expect(results_2).to eq []
      end

    end

  end

  describe 'suggest_tag' do

    it 'suggests the tags' do
      [
      {
        id: 'id_t1',
        text: 'tag1',
        source:'profiles'
      },
      {
        id: 'id_t2',
        text: 'r2',
        source:'profiles'
      },
      {
        id: 'id_t3',
        text: 'tag3',
        source:'profiles'
      }
      ].each{|tag| MetaRepos::Tags.save(tag)}
      post suggest_tag_route, {query: ['Tá'], source: 'profiles'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([
        {
          "id" => 'id_t1',
          "text"=> 'tag1'
        },
         {
          "id" => 'id_t3',
          "text"=> 'tag3'
        }
      ])
    end

    it 'suggests only the tags with the correct source' do
      [
      {
        id: 'id_t1',
        text: 'tag1',
        source:'profiles'
      },
      {
        id: 'id_t2',
        text: 'r2',
        source:'profiles'
      },
      {
        id: 'id_t3',
        text: 'tagí3',
        source:'productions'
      }
      ].each{|tag| MetaRepos::Tags.save(tag)}
      post suggest_tag_route, {query: ['TÁ'], source: 'productions'}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([
        {
          "id" => 'id_t3',
          "text"=> 'tagí3'
        }
      ])
    end
  end


  describe 'suggest_program' do
    it 'suggets the tags' do
      expect(Services::Search).to receive(:get_program_suggestions).once.with('es', event_id, ['my'], {}).and_return [{text: 'my_title', type:'title'}]
      post suggest_program_tag_route, {query: ['my'], lang:'es', event_id: event_id, filters: {}}
      expect(parsed_response['status']).to eq('success')
      expect(parsed_response['items']).to eq([{"text"=>"my_title", "type"=>"title"}])
    end
  end


end
