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

  describe '.get_photos_from_form' do
    let(:proposal) do
      {
        '1' => ['photo1.jpg', 'photo2.jpg'],
        '2' => 'not_a_photo_array',
        '3' => { img: ['pdf_photo.jpg'] },
        'other' => ['should_be_ignored.jpg']
      }
    end
    let(:form_blocks) do
      {
        '1' => { input: 'UploadPhotos' },
        '2' => { input: 'Input' },
        '3' => { input: 'LinkUploadPDF' }
      }
    end

    before do
      allow(Repos::Forms).to receive(:get_form_blocks).and_return(form_blocks)
    end

    it 'extracts photos from the upload photos field' do
      expect(Services::Gallery.get_photos_from_form(proposal)).to include('photo1.jpg', 'photo2.jpg')
    end

    it 'extracts photos from link upload PDF field' do
      expect(Services::Gallery.get_photos_from_form(proposal)).to include('pdf_photo.jpg')
    end

    it 'does not extract photos from non-upload fields' do
      expect(Services::Gallery.get_photos_from_form(proposal)).not_to include('not_a_photo_array')
    end

    it 'ignores non-numeric fields in the form blocks' do
      expect(Services::Gallery.get_photos_from_form(proposal)).not_to include('should_be_ignored.jpg')
    end
  end
end

