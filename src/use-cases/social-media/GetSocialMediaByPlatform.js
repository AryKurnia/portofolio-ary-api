const NotFoundError = require('../../exceptions/NotFoundError');

class GetSocialMediaByPlatform {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute(platform) {
    const result = await this._socialMediaRepository.findByPlatform(platform);
    if (!result) {
      throw new NotFoundError(`Social media dengan platform ${platform} tidak ditemukan`);
    }
    return result;
  }
}

module.exports = GetSocialMediaByPlatform;