# frozen_string_literal: true

describe Services::Gallery do
  let(:profile_id) { SecureRandom.uuid }
  let(:gallery) do
    {
      id: profile_id,
      profile_id: profile_id,
      source: 'profiles',
      name: 'name',
      photos: ['profile_picture.jpg']
    }
  end

  before(:each) do
    MetaRepos::Galleries.clear
    MetaRepos::Assets.clear
    MetaRepos::Galleries.save(gallery)
    Services::Assets.create({ photos: ['profile_picture.jpg'] }, profile_id)
  end

  describe 'update_pictures' do
    it 'deletes pictures if no presented in new gallery' do
      allow(Cloudinary::Api).to receive(:delete_resources).and_return(true)
      expect(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      Services::Gallery.update_pictures profile_id
    end

    it 'does not delete images if unchanged' do
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      Services::Gallery.update_pictures profile_id, { photos: ['profile_picture.jpg'] }
    end

    it 'creates new assets' do
      expect(Services::Assets).to receive(:create).with({ profile_picture: ['profile_picture.jpg'] }, profile_id).once
      Services::Gallery.update_pictures profile_id, { profile_picture: ['profile_picture.jpg'] }
    end
  end

  describe 'delete_pictures' do
    it 'deletes unused pictures if there are no more holders' do
      expect(Cloudinary::Api).to receive(:delete_resources).with(['profile_picture.jpg'])
      Services::Gallery.delete_pictures ['profile_picture.jpg'], profile_id
    end

    it 'does not delete picture if there are more holders' do
      Services::Assets.create({ img: ['profile_picture.jpg'] }, 'new_holder_id')
      expect(Cloudinary::Api).not_to receive(:delete_resources)
      Services::Gallery.delete_pictures ['profile_picture.jpg'], profile_id
    end
  end
end
