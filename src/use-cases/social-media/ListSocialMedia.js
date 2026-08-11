class ListSocialMedia {
  constructor(socialMediaRepository) {
    this._socialMediaRepository = socialMediaRepository;
  }

  async execute() {
    return this._socialMediaRepository.findAll();
  }
}

module.exports = ListSocialMedia;