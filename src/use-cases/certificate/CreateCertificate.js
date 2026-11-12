const Certificate = require('../../entities/Certificate');
const validateCertificate = require('./validateCertificate');

class CreateCertificate {
  constructor({ certificateRepository, mediaRepository }) {
    this._certificateRepository = certificateRepository;
    this._mediaRepository = mediaRepository;
  }

  // Sertifikat baru ditaruh paling akhir; default draf (is_published = false).
  async execute({
    name,
    issuer,
    issuedAt,
    expiresAt,
    credentialId,
    credentialUrl,
    fileMediaId,
    isPublished,
  }) {
    const existing = await this._certificateRepository.findAll();
    const certificate = new Certificate({
      name,
      issuer,
      issuedAt,
      expiresAt,
      credentialId,
      credentialUrl,
      fileMediaId,
      isPublished,
      sortOrder: Math.max(0, ...existing.map((item) => item.sortOrder)) + 1,
    });
    await validateCertificate(certificate, this._mediaRepository);
    return this._certificateRepository.create(certificate);
  }
}

module.exports = CreateCertificate;
