const SocialMedia = require('../../entities/SocialMedia');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');

class UpdateSocialMedia {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute(platform, { url, username, enabled }) {
    const existingSocialMedia = await this._socialMediaRepository.findByPlatform(platform);
    if (!existingSocialMedia) {
      throw new NotFoundError(`Social media for platform ${platform} was not found.`);
    }

    const updatedSocialMedia = new SocialMedia({
      ...existingSocialMedia,
      ...pickDefined({ url, username, enabled }),
    });

    return this._socialMediaRepository.update(platform, updatedSocialMedia);
  }
}

module.exports = UpdateSocialMedia;
