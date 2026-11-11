const SocialLink = require('../../entities/SocialLink');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');

class UpdateSocialLink {
  constructor({ socialLinkRepository }) {
    this._socialLinkRepository = socialLinkRepository;
  }

  async execute(id, { platform, label, url, isPublished }) {
    const existing = await this._socialLinkRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Social link with id ${id} was not found.`);
    }
    const updated = new SocialLink({
      ...existing,
      ...pickDefined({ platform, label, url, isPublished }),
    });
    return this._socialLinkRepository.update(id, updated);
  }
}

module.exports = UpdateSocialLink;
