const NotFoundError = require('../../exceptions/NotFoundError');

// File sertifikat tidak dihapus di sini: media yang tidak lagi dirujuk dibersihkan oleh
// `npm run media:cleanup`.
class DeleteCertificate {
  constructor({ certificateRepository }) {
    this._certificateRepository = certificateRepository;
  }

  async execute(id) {
    if (!(await this._certificateRepository.findById(id))) {
      throw new NotFoundError(`Certificate with id ${id} was not found.`);
    }
    await this._certificateRepository.delete(id);
  }
}

module.exports = DeleteCertificate;
