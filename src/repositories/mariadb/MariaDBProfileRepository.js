const ProfileRepository = require('../ProfileRepository');
const Profile = require('../../entities/Profile');
const ProfileModel = require('../../infrastructure/db/models/Profile');

const PROFILE_ID = 1;

class MariaDBProfileRepository extends ProfileRepository {
  constructor(profileModel = ProfileModel) {
    super();
    this._profileModel = profileModel;
  }

  async get() {
    const row = await this._profileModel.findByPk(PROFILE_ID);
    return row ? new Profile(row.toJSON()) : null;
  }

  async update(profile) {
    await this._profileModel.update(
      {
        greeting: profile.greeting,
        tagline: profile.tagline,
        about: profile.about,
        projectIntro: profile.projectIntro,
        email: profile.email,
        photoMediaId: profile.photoMediaId,
      },
      { where: { id: PROFILE_ID } }
    );
    return this.get();
  }
}

module.exports = MariaDBProfileRepository;
