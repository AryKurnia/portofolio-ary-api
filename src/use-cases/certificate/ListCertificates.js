class ListCertificates {
  constructor({ certificateRepository }) {
    this._certificateRepository = certificateRepository;
  }

  // Admin: semua sertifikat termasuk draf.
  async execute() {
    return this._certificateRepository.findAll();
  }
}

module.exports = ListCertificates;
