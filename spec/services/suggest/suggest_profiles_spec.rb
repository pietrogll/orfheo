describe Services::Suggest do

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
  let(:o_profile_name){'o profile name'}


  let(:profile){
    {
      id: profile_id,
      facets: [ 'artist', 'creative', 'manager'],
      name: profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id],
      profile_picture: ['profile_picture.jpg']
    }
  }

  let(:otter_profile){
    {
      id: otter_profile_id,
      facets: [ 'manager', 'business'],
      name: otter_profile_name,
      address: {:postal_code => '46020', :locality => 'city'},
      tags: [tag_id, otter_tag_id],
      profile_picture: nil
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

  let(:profile_collection){Repos::Profiles.class_variable_get(:@@collection)}

  before(:each){
    profile_collection.indexes.create_one( { :name => 'text' } )
    profile_collection.insert_many([profile, otter_profile, other_profile, o_profile])
  }

  after(:each){
    profile_collection.indexes.drop_all
  }

  let(:db_key){'profiles'}

  describe 'suggest profiles name' do

    # 1. text search with index do not perform partial text search --> it only makes exact (case and diacritics insensitive) search
    # 2. the query with 'gte' and 'lt' works only for word at the beginning of the string. it works with normal index on the corresponding field
    # 3. regex match (case insensitive and with all diacritcs specified as options) has the problem that can not make use of any index
    # POSSIBILE SOLUTIONS: 
    # -1-> no suggestions and text index search query (returns all results containing the specified world)
    # -2-> suggest only if the name begins with the characters(returns only the profile with the name selected)
    # -3-> suggest all names with the character appearing somewhere (returns only the selected profile)
    # --> new collection 'profilenams' that include documents with fields :name_token, :name, :profile_id. For each profile there are as many documents as the number of words composing its name. The sugestion would search in profilenames collection on the field token. ATT: Ok when user is writing one word but starting from the second it does not work 

    xit 'returns a list with the profile names beginning with the text query' do  
      query = {name: 'ot'}
      
      results = Services::Suggest.profile_names db_key, query 
    
      expected_results = [{name: other_profile[:name]}, {name: otter_profile[:name]}]
      expect(results).to eq expected_results
    end

    xit 'returns a list with the profile names including text query' do   profile_collection.indexes.each do |index|
      puts index
  end
      query = {name: 'prof'}
      
      results = Services::Suggest.profile_names db_key, query 
    
      expected_results = [{name: profile[:name]}, {name: o_profile[:name]}, {name: other_profile[:name]}]
      expect(results).to eq expected_results
    end

    xit 'returns a list with the profile names without caring about case' do
      capitalized_name = 'PRofile nAme'
      Repos::Profiles.modify({id: profile_id, name: capitalized_name})  
      query = {name: 'prof'}
      
      results = Services::Suggest.profile_names db_key, query 
    
      expected_results = [{name: capitalized_name}, {name: o_profile[:name]}, {name: other_profile[:name]}]
      expect(results).to eq expected_results
    end

    xit 'returns a list with the profile names without caring about accents' do
      accented_name = 'prófile namé'
      Repos::Profiles.modify({id: profile_id, name: accented_name})  
      query = {name: 'prof'}
      
      results = Services::Suggest.profile_names db_key, query 
    
      expected_results = [{name: accented_name}, {name: other_profile[:name]}]
      expect(results).to eq expected_results
    end

  end

  describe 'suggest locality' do
    # db.profiles.aggregate(
    # [
    #   {$match: {$and: [{'address.locality': {$gte: 'me'}}, {'address.locality': {$lt: 'mf'}}]}}, 
    #   {$group: {_id: '$address.locality', count: {$sum: 1}}},
    #   {$sort: {'count': -1}}
    # ],
    # {collation: {locale:'en', strength: 1, alternate: 'shifted'}}
    # )
  end
end