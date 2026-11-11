const Joi = require('joi');

const idParamSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
});

const listQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const createSkillPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow('', null),
  enabled: Joi.boolean().default(true),
});

const updateSkillPayloadSchema = Joi.object({
  name: Joi.string().max(100).required(),
  description: Joi.string().allow('', null).required(),
  enabled: Joi.boolean().required(),
});

// Payload multipart berupa stream: cukup pastikan field `logo` ada.
// Joi.any() dipakai agar stream tidak di-clone/diubah oleh Joi.
const uploadLogoPayloadSchema = Joi.object({
  logo: Joi.any().required(),
}).unknown(true);

module.exports = {
  idParamSchema,
  listQuerySchema,
  createSkillPayloadSchema,
  updateSkillPayloadSchema,
  uploadLogoPayloadSchema,
};
