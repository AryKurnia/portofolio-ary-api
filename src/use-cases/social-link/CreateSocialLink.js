const SocialLink = require('../../entities/SocialLink');

class CreateSocialLink {
  constructor({ socialLinkRepository }) {
    this._socialLinkRepository = socialLinkRepository;
  }

  // Link baru ditaruh paling akhir.
  async execute({ platform, label, url, isPublished }) {
    const links = await this._socialLinkRepository.findAll();
    const sortOrder = Math.max(0, ...links.map((link) => link.sortOrder)) + 1;
    return this._socialLinkRepository.create(
      new SocialLink({ platform, label, url, isPublished, sortOrder })
    );
  }
}

module.exports = CreateSocialLink;
