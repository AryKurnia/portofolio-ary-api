const ProfileRepository = require('../ProfileRepository');
const Profile = require('../../entities/Profile');
const ProfileModel = require('../../infrastructure/db/models/Profile');
const Media = require('../../entities/Media');

const PROFILE_ID = 1;

class MariaDBProfileRepository extends ProfileRepository {
  constructor(profileModel = ProfileModel) {
    super();
    this._profileModel = profileModel;
  }

  async get() {
    const row = await this._profileModel.findByPk(PROFILE_ID, {
      include: [{ association: 'photo' }],
    });
    if (!row) return null;
    const { photo, ...data } = row.toJSON();
    return new Profile({ ...data, photo: photo ? new Media(photo) : null });
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
