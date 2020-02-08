describe Services::Users do

  include_examples 'ids'
  include_examples 'db_elements'

  let(:current_time){Time.now}

  describe 'register_login' do 

  	before(:each){
	  	Repos::Users.save user
  		allow(Time).to receive(:now).and_return(current_time)
  	}

  	it 'updates the last_login field with the current Time' do
  		Services::Users.register_login user_id
  		saved_time = current_time.to_i*1000
  		expect(Repos::Users.get_by_id(user_id)[:last_login]).to be(saved_time)
  	end

  end



end