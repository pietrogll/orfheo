describe 'Actions Users' do

  include_examples 'ids'
  include_examples 'db_elements'

  let(:stored_time){Time.new(2019,1,1)}
  let(:intermediated_time){Time.new(2019,2,1)}
  let(:latest_time){Time.new(2019,2,5)}


  before(:each){
	 	Repos::Users.save user
  }


  describe 'UpdateLoginTime' do 
    it 'updates the login date if more than 24 hours has passed from the last update' do
      allow(Time).to receive(:now).and_return(latest_time)

      expect(Services::Users).to receive(:register_login).with(user_id).once.and_call_original
      Actions::UpdateLoginTime.run user_id, stored_time
      Actions::UpdateLoginTime.run user_id, latest_time
    end

    it 'updates the login date anytime 24 hours has passed from the last update' do
      expect(Services::Users).to receive(:register_login).with(user_id).twice.and_call_original

      allow(Time).to receive(:now).and_return(intermediated_time)
      Actions::UpdateLoginTime.run user_id, stored_time #update
      Actions::UpdateLoginTime.run user_id, intermediated_time #do not update
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to be(intermediated_time.to_i*1000)
     
      allow(Time).to receive(:now).and_return(latest_time)
      Actions::UpdateLoginTime.run user_id, intermediated_time #update
      Actions::UpdateLoginTime.run user_id, latest_time #do not update
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to be(latest_time.to_i*1000)
    end

    it 'returns the last login time' do
      allow(Time).to receive(:now).and_return(intermediated_time)
      
      result = Actions::UpdateLoginTime.run user_id, stored_time
      expect(result).to be intermediated_time

      result_2 = Actions::UpdateLoginTime.run user_id, intermediated_time
      expect(result_2).to be intermediated_time
    end
	
	end

end