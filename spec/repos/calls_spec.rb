describe Repos::Calls do



  let(:user_id){'45825599-b8cf-499c-825c-a7134a3f1ff0'}
  let(:call_id){'b5bc4203-9379-4de0-856a-55e1e5f3fac6'}
  


  let(:call){
    {
      user_id: user_id,
      id: call_id,
      whitelist: [],
      forms: {
        es:{
          artist: {
            music: {
              blocks: {
                title: {type: "mandatory"},
                description: {type: "mandatory"},
                short_description: {type: "mandatory"},
                duration: {type: "mandatory"},
                '1': {type: "optional"},
                '2': {type: "mandatory"}  
              }
            }
          },
          space: {
            home: {
              blocks: {
                '1': {type: "optional"},
                '2': {type: "mandatory"}
              }
            }
          }
        }
      }
    }
  }

  before(:each){
    @db['calls'].insert_one(call)
  }

  describe 'Exists?' do
    it 'checks if matched element is already in any document' do
      expect(Repos::Calls.exists? call_id).to eq(true)
      expect(Repos::Calls.exists? 'otter').to eq(false)
    end
  end



  describe 'Whitelist' do
    it 'Stores the whitelist' do
      expect(Repos::Calls.get_by_id(call_id)[:whitelist]).to eq([])
      Repos::Calls.add_whitelist call_id, ['walter@white']
      expect(Repos::Calls.get_by_id(call_id)[:whitelist]).to eq(['walter@white'])
    end
  end


  

end
