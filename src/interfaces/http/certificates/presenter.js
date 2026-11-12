const { toImageResponse } = require('../shared/media');

const toCertificateResponse = (certificate) => ({
  id: certificate.id,
  name: certificate.name,
  issuer: certificate.issuer,
  issued_at: certificate.issuedAt,
  expires_at: certificate.expiresAt,
  credential_id: certificate.credentialId,
  credential_url: certificate.credentialUrl,
  file_id: certificate.fileMediaId,
  file: toImageResponse(certificate.file),
  is_published: certificate.isPublished,
  sort_order: certificate.sortOrder,
  created_at: certificate.createdAt,
  updated_at: certificate.updatedAt,
});

module.exports = { toCertificateResponse };
