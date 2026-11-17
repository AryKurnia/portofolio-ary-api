class ListSocialLinks {
  constructor({ socialLinkRepository }) {
    this._socialLinkRepository = socialLinkRepository;
  }

  async execute() {
    return this._socialLinkRepository.findAll();
  }
}

module.exports = ListSocialLinks;
