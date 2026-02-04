require 'rails_helper'

RSpec.describe Guards, type: :controller do
  controller(ApplicationController) do
    def test_admin_check
      check_admin!
      render json: { admin: true }
    end

    def test_admin_status
      render json: { is_admin: admin? }
    end
  end

  before do
    routes.draw do
      get 'test_admin_check' => 'anonymous#test_admin_check'
      get 'test_admin_status' => 'anonymous#test_admin_status'
    end
  end

  describe '#check_admin!' do
    context 'when user is admin' do
      before do
        allow(MetaRepos::Admins).to receive(:exists?).and_return(true)
        session[:identity] = 'admin_user_id'
      end

      it 'allows access' do
        get :test_admin_check
        expect(response).to have_http_status(:success)
      end
    end

    context 'when user is not admin' do
      before do
        allow(MetaRepos::Admins).to receive(:exists?).and_return(false)
        session[:identity] = 'regular_user_id'
      end

      it 'raises Pard::Invalid::Admin exception' do
        expect {
          get :test_admin_check
        }.to raise_error(Pard::Invalid::Admin)
      end
    end
  end

  describe '#admin?' do
    it 'returns true when user is admin' do
      allow(MetaRepos::Admins).to receive(:exists?).and_return(true)
      session[:identity] = 'admin_user_id'

      get :test_admin_status
      expect(JSON.parse(response.body)['is_admin']).to be true
    end

    it 'returns false when user is not admin' do
      allow(MetaRepos::Admins).to receive(:exists?).and_return(false)
      session[:identity] = 'regular_user_id'

      get :test_admin_status
      expect(JSON.parse(response.body)['is_admin']).to be false
    end
  end

  describe '#check_event_ownership!' do
    let(:controller_instance) { controller }
    let(:event_id) { 'event_123' }
    let(:owner_id) { 'user_456' }

    before do
      allow(Repos::Events).to receive(:exists?).with(event_id).and_return(true)
      allow(Repos::Events).to receive(:get_owner).with(event_id).and_return(owner_id)
    end

    context 'when user owns the event' do
      it 'returns the owner_id' do
        controller_instance.session[:identity] = owner_id
        result = controller_instance.send(:check_event_ownership!, event_id)
        expect(result).to eq(owner_id)
      end
    end

    context 'when user is admin' do
      it 'allows access' do
        controller_instance.session[:identity] = 'another_user'
        allow(MetaRepos::Admins).to receive(:exists?).and_return(true)

        result = controller_instance.send(:check_event_ownership!, event_id)
        expect(result).to eq(owner_id)
      end
    end

    context 'when user does not own the event and is not admin' do
      it 'raises Pard::Invalid::EventOwnership' do
        controller_instance.session[:identity] = 'different_user'
        allow(MetaRepos::Admins).to receive(:exists?).and_return(false)

        expect {
          controller_instance.send(:check_event_ownership!, event_id)
        }.to raise_error(Pard::Invalid::EventOwnership)
      end
    end
  end
end
