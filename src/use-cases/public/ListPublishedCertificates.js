class ListPublishedCertificates {
  constructor({ certificateRepository }) {
    this._certificateRepository = certificateRepository;
  }

  async execute() {
    return this._certificateRepository.findAll({ publishedOnly: true });
  }
}

module.exports = ListPublishedCertificates;
