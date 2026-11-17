class ListPublicSocialLinks {
  constructor(socialLinkRepository) {
    this._socialLinkRepository = socialLinkRepository;
  }

  async execute() {
    return this._socialLinkRepository.findAll({ publishedOnly: true });
  }
}

module.exports = ListPublicSocialLinks;
