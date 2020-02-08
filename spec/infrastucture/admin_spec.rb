# require './infrastructure/actions_index'
require "rspec/em"


describe 'Actions::SetPeriodicMailsUpdate' do

	include RSpec::EM::FakeClock


	describe 'generic mail update' do

    let(:mailer){Services::Mails.new}
    
    before { clock.stub }
  	after { clock.reset }

    let(:process_id){'process_id'}
		let(:channel){'channel'}

    PERIOD = 15

    
    it 'sends message to EsClients after PERIOD time elapsed' do
      message = {status: 'success', event:'updateDeliveryStatus', model:{total:0, done: 0, status: nil}}.to_json
      expect(Services::EsClients).to receive(:send_message).once.with(channel, message)
    	Actions::SetPeriodicMailsUpdate.run process_id, channel
    	clock.tick(PERIOD)
    end

    it 'cancel the update loop if process not working nor queued' do
      expect(EM).to receive(:cancel_timer)
      Actions::SetPeriodicMailsUpdate.run process_id, channel
      clock.tick(PERIOD)
    end


  end

end