const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderSocialLinks {
  constructor({ socialLinkRepository }) {
    this._socialLinkRepository = socialLinkRepository;
  }

  async execute(ids) {
    const links = await this._socialLinkRepository.findAll();
    assertCompleteOrder(
      links.map((link) => link.id),
      ids,
      'social link'
    );
    await this._socialLinkRepository.reorder(ids);
  }
}

module.exports = ReorderSocialLinks;
