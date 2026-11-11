const Joi = require('joi');
const Media = require('../../../entities/Media');

const uploadQuerySchema = Joi.object({
  kind: Joi.string()
    .valid(...Media.KINDS)
    .required(),
});

// Payload multipart berupa stream; cukup pastikan field `file` ada (Joi.any agar stream tidak diubah).
const uploadPayloadSchema = Joi.object({ file: Joi.any().required() }).unknown(true);

module.exports = { uploadQuerySchema, uploadPayloadSchema };
