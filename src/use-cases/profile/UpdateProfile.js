const Profile = require('../../entities/Profile');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');

class UpdateProfile {
  constructor(profileRepository) {
    this._profileRepository = profileRepository;
  }

  // Tombol "Save changes" per section hanya mengirim field section itu.
  async execute({ greeting, tagline, about, projectIntro, email }) {
    const existingProfile = await this._profileRepository.get();
    if (!existingProfile) {
      throw new NotFoundError('Profile has not been set up yet.');
    }

    const updatedProfile = new Profile({
      ...existingProfile,
      ...pickDefined({ greeting, tagline, about, projectIntro, email }),
    });
    return this._profileRepository.update(updatedProfile);
  }
}

module.exports = UpdateProfile;
