const NotFoundError = require('../../exceptions/NotFoundError');

class DeleteSocialLink {
  constructor({ socialLinkRepository }) {
    this._socialLinkRepository = socialLinkRepository;
  }

  async execute(id) {
    if (!(await this._socialLinkRepository.findById(id))) {
      throw new NotFoundError(`Social link with id ${id} was not found.`);
    }
    await this._socialLinkRepository.delete(id);
  }
}

module.exports = DeleteSocialLink;
