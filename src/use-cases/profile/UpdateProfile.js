const Profile = require('../../entities/Profile');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');
const pickDefined = require('../pickDefined');

class UpdateProfile {
  constructor(profileRepository, mediaRepository) {
    this._profileRepository = profileRepository;
    this._mediaRepository = mediaRepository;
  }

  // Tombol "Save changes" per section hanya mengirim field section itu.
  // photoMediaId: id media jenis profile_photo, atau null untuk menghapus foto (K13).
  async execute({ greeting, tagline, about, projectIntro, email, photoMediaId }) {
    const existingProfile = await this._profileRepository.get();
    if (!existingProfile) {
      throw new NotFoundError('Profile has not been set up yet.');
    }

    if (photoMediaId) {
      const media = await this._mediaRepository.findById(photoMediaId);
      if (!media || media.kind !== 'profile_photo') {
        throw new ValidationError('Some fields are invalid.', [
          {
            field: 'photo_id',
            message: media
              ? 'Photo must be uploaded as a profile photo.'
              : 'Photo was not found. Upload it first.',
          },
        ]);
      }
    }

    const updatedProfile = new Profile({
      ...existingProfile,
      ...pickDefined({ greeting, tagline, about, projectIntro, email, photoMediaId }),
    });
    return this._profileRepository.update(updatedProfile);
  }
}

module.exports = UpdateProfile;
