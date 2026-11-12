const container = require('../../../infrastructure/container');
const { toCertificateResponse } = require('./presenter');

const toCertificateInput = (payload) => ({
  name: payload.name,
  issuer: payload.issuer,
  issuedAt: payload.issued_at,
  expiresAt: payload.expires_at,
  credentialId: payload.credential_id,
  credentialUrl: payload.credential_url,
  fileMediaId: payload.file_id,
  isPublished: payload.is_published,
});

module.exports = {
  async list(request, h) {
    const certificates = await container.listCertificates.execute();
    return h.response({ data: certificates.map(toCertificateResponse) }).code(200);
  },

  async create(request, h) {
    const certificate = await container.createCertificate.execute(
      toCertificateInput(request.payload)
    );
    return h.response({ data: toCertificateResponse(certificate) }).code(201);
  },

  async update(request, h) {
    const certificate = await container.updateCertificate.execute(
      request.params.id,
      toCertificateInput(request.payload)
    );
    return h.response({ data: toCertificateResponse(certificate) }).code(200);
  },

  async remove(request, h) {
    await container.deleteCertificate.execute(request.params.id);
    return h.response().code(204);
  },

  async reorder(request, h) {
    await container.reorderCertificates.execute(request.payload.ids);
    return h.response().code(204);
  },
};
