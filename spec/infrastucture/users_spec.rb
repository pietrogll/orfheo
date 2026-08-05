# frozen_string_literal: true

require 'rails_helper'

describe 'Actions Users' do
  include_examples 'ids'
  include_examples 'db_elements'

  let(:stored_time) { Time.new(2019, 1, 1) }
  let(:intermediated_time) { Time.new(2019, 2, 1) }
  let(:latest_time) { Time.new(2019, 2, 5) }

  before(:each) do
    Repos::Users.save user
  end

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
      Actions::UpdateLoginTime.run user_id, stored_time # update
      Actions::UpdateLoginTime.run user_id, intermediated_time # do not update
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to be(intermediated_time.to_i * 1000)

      allow(Time).to receive(:now).and_return(latest_time)
      Actions::UpdateLoginTime.run user_id, intermediated_time # update
      Actions::UpdateLoginTime.run user_id, latest_time # do not update
      expect(Repos::Users.get_by_id(user_id)[:last_login]).to be(latest_time.to_i * 1000)
    end

    it 'returns the last login time' do
      allow(Time).to receive(:now).and_return(intermediated_time)

      result = Actions::UpdateLoginTime.run user_id, stored_time
      expect(result).to be intermediated_time

      result_2 = Actions::UpdateLoginTime.run user_id, intermediated_time
      expect(result_2).to be intermediated_time
    end
  end

  describe 'UserRegistersUser' do
    let(:event_id) { 'event-id-123' }
    let(:register_params) do
      {
        email: 'new_unique_email@test.com',
        password: 'securepassword',
        lang: 'en',
        notification: 'true'
      }
    end

    let(:mailer_double) { instance_double(Services::Mails, deliver_mail_to: true) }

    before do
      allow(Services::Mails).to receive(:new).and_return(mailer_double)
    end

    context 'when the email does not exist' do
      it 'registers the user and creates a database record' do
        expect {
          Actions::UserRegistersUser.run(event_id, register_params)
        }.to change { Repos::Users.get({ email: 'new_unique_email@test.com' }).count }.by(1)
      end
    end

    context 'when the email already exists' do
      it 'raises Pard::Invalid::ExistingUser' do
        existing_params = register_params.merge(email: 'email@test.com')
        expect {
          Actions::UserRegistersUser.run(event_id, existing_params)
        }.to raise_error(Pard::Invalid::ExistingUser)
      end
    end
  end
end
