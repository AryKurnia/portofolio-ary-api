const SocialMediaRepository = require('../SocialMediaRepository');
const SocialMedia = require('../../entities/SocialMedia');
const SocialMediaModel = require('../../infrastructure/db/models/SocialMedia');

class MariaDBSocialMediaRepository extends SocialMediaRepository {
  constructor(socialMediaModel = SocialMediaModel) {
    super();
    this._socialMediaModel = socialMediaModel;
  }

  async findAll() {
    const rows = await this._socialMediaModel.findAll();
    return rows.map((row) => new SocialMedia(row.toJSON()));
  }

  async findByPlatform(platform) {
    const row = await this._socialMediaModel.findOne({ where: { platform } });
    return row ? new SocialMedia(row.toJSON()) : null;
  }

  async update(platform, socialMedia) {
    await this._socialMediaModel.update(
      {
        url: socialMedia.url,
        username: socialMedia.username,
        enabled: socialMedia.enabled,
      },
      { where: { platform } }
    );

    const row = await this._socialMediaModel.findOne({ where: { platform } });
    return new SocialMedia(row.toJSON());
  }
}

module.exports = MariaDBSocialMediaRepository;