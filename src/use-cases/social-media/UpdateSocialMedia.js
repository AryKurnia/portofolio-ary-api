const SocialMedia = require('../../entities/SocialMedia');
const NotFoundError = require('../../exceptions/NotFoundError');

class UpdateSocialMedia {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute(platform, { url, username, enabled }) {
    const existingSocialMedia = await this._socialMediaRepository.findByPlatform(platform);
    if (!existingSocialMedia) {
      throw new NotFoundError(`Social media for platform ${platform} was not found.`);
    }

    // Payload bersifat parsial: field yang tidak dikirim (undefined) tidak boleh menimpa
    // nilai lama — termasuk default `enabled = true` di entity SocialMedia.
    const changes = Object.fromEntries(
      Object.entries({ url, username, enabled }).filter(([, value]) => value !== undefined)
    );

    const updatedSocialMedia = new SocialMedia({
      ...existingSocialMedia,
      ...changes,
    });

    return this._socialMediaRepository.update(platform, updatedSocialMedia);
  }
}

module.exports = UpdateSocialMedia;
