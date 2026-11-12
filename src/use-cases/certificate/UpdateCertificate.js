const Certificate = require('../../entities/Certificate');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');
const validateCertificate = require('./validateCertificate');

class UpdateCertificate {
  constructor({ certificateRepository, mediaRepository }) {
    this._certificateRepository = certificateRepository;
    this._mediaRepository = mediaRepository;
  }

  // PATCH parsial; aturan divalidasi terhadap gabungan data lama + perubahan.
  async execute(
    id,
    { name, issuer, issuedAt, expiresAt, credentialId, credentialUrl, fileMediaId, isPublished }
  ) {
    const existing = await this._certificateRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Certificate with id ${id} was not found.`);
    }

    const updated = new Certificate({
      ...existing,
      ...pickDefined({
        name,
        issuer,
        issuedAt,
        expiresAt,
        credentialId,
        credentialUrl,
        fileMediaId,
        isPublished,
      }),
    });
    await validateCertificate(updated, this._mediaRepository);
    return this._certificateRepository.update(id, updated);
  }
}

module.exports = UpdateCertificate;
