const SocialMedia = require('../../entities/SocialMedia');
const NotFoundError = require('../../exceptions/NotFoundError');

class UpdateSocialMedia {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute(platform, { url, username, enabled }) {
    const existingSocialMedia = await this._socialMediaRepository.findByPlatform(platform);
    if (!existingSocialMedia) {
      throw new NotFoundError(`Social media dengan platform ${platform} tidak ditemukan`);
    }

    const updatedSocialMedia = new SocialMedia({
      ...existingSocialMedia,
      url,
      username,
      enabled,
    })

    return this._socialMediaRepository.update(platform, updatedSocialMedia);
  }
}

module.exports = UpdateSocialMedia;