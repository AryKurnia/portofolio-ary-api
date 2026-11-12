const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderCertificates {
  constructor({ certificateRepository }) {
    this._certificateRepository = certificateRepository;
  }

  async execute(ids) {
    const certificates = await this._certificateRepository.findAll();
    assertCompleteOrder(
      certificates.map((certificate) => certificate.id),
      ids,
      'certificate'
    );
    await this._certificateRepository.reorder(ids);
  }
}

module.exports = ReorderCertificates;
