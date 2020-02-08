require 'sidekiq/testing' 

describe Workers do

	before(:each) do
    Sidekiq::Worker.clear_all
  end

	
	describe 'Mailer' do

		let(:mailer){Services::Mails.new}
    
    before(:each){
      allow(Services::Mails).to receive(:new).and_return(mailer)
    }

		let(:worker_mailer){Workers::BulkMailer}
		let(:status_checker){WorkersServices::Status}


		it 'increases the jobs queue by 1' do
			expect {
		  	worker_mailer.perform_async({})
			}.to change(worker_mailer.jobs, :size).by(1)
		end

		it 'calls Services::MailingList.get_interested_users if not receivers_list specified' do
			expect(Services::MailingList).to receive(:get_interested_users).and_return([])

			worker_mailer.perform_async({})
			Sidekiq::Worker.drain_all
		end

		it 'calls Services::MailingList.build_receivers_for if receivers_list given' do
			receivers_list = ['a@a.a','b@b.b']
			expect(Services::MailingList).to receive(:build_receivers_for).with(receivers_list).and_return([])

			worker_mailer.perform_async({receivers: receivers_list})
			Sidekiq::Worker.drain_all
		end

		it 'calls Services::Mails' do
			expect(mailer).to receive(:deliver_to_mailing_list).and_return([])
			
			worker_mailer.perform_async({})
			Sidekiq::Worker.drain_all
		end

		it 'stores the mailing_list_length for retriving by status_checker' do
			mailing_list = ['a@a.a','b@b.b']
			receivers_list = mailing_list.map{|e|{lang:'es',email: e}}

			expect(Services::MailingList).to receive(:build_receivers_for).with(receivers_list).and_return(receivers_list)
			expect(mailer).to receive(:deliver_to_mailing_list).and_return(mailing_list)

			
			process_id = worker_mailer.perform_async({receivers: receivers_list})
			Sidekiq::Worker.drain_all

			expect(status_checker.total process_id).to eq(receivers_list.count)
		end


		it 'stores the receivers_done_length for retriving by status_checker' do
			mailing_list = ['a@a.a','b@b.b']
			receivers_list = mailing_list.map{|e|{lang:'es',email: e}}

			allow(Services::MailingList).to receive(:build_receivers_for).with(receivers_list).and_return(receivers_list)
			allow(mailer).to receive(:deliver_mail_to)
			
			process_id = worker_mailer.perform_async({receivers: receivers_list})
			Sidekiq::Worker.drain_all

			expect(status_checker.at process_id).to eq(receivers_list.count)
		end


		

	
	end
end