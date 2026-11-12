const Joi = require('joi');
const { plainText, httpsUrl, yearMonth } = require('../shared/validation');

const fields = {
  name: plainText(150),
  issuer: plainText(100),
  issued_at: yearMonth(),
  // null = tidak kedaluwarsa.
  expires_at: yearMonth().allow(null),
  credential_id: plainText(100).allow(null),
  credential_url: httpsUrl().allow(null),
  file_id: Joi.number().integer().positive().allow(null),
  is_published: Joi.boolean(),
};

const createCertificatePayloadSchema = Joi.object({
  ...fields,
  name: fields.name.required(),
  issuer: fields.issuer.required(),
  issued_at: fields.issued_at.required(),
});

const updateCertificatePayloadSchema = Joi.object(fields).min(1);

module.exports = { createCertificatePayloadSchema, updateCertificatePayloadSchema };
