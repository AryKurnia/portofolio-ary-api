const Joi = require('joi');
const { plainText, httpsUrl } = require('../shared/validation');

const listProjectsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(12),
});

const fields = {
  title: plainText(60),
  description: plainText(300),
  image_id: Joi.number().integer().positive().allow(null),
  link_url: httpsUrl().allow(null),
  show_button: Joi.boolean(),
  is_published: Joi.boolean(),
};

const createProjectPayloadSchema = Joi.object({
  ...fields,
  title: fields.title.required(),
  description: fields.description.required(),
});

const updateProjectPayloadSchema = Joi.object(fields).min(1);

module.exports = {
  listProjectsQuerySchema,
  createProjectPayloadSchema,
  updateProjectPayloadSchema,
};
