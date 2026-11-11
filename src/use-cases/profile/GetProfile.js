const NotFoundError = require('../../exceptions/NotFoundError');

class GetProfile {
  constructor(profileRepository) {
    this._profileRepository = profileRepository;
  }

  async execute() {
    const profile = await this._profileRepository.get();
    if (!profile) {
      throw new NotFoundError('Profile has not been set up yet.');
    }
    return profile;
  }
}

module.exports = GetProfile;
