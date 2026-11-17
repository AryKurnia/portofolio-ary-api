const Joi = require('joi');
const { plainText, idParamSchema } = require('../shared/validation');

const id = () => Joi.number().integer().positive();

const listSkillsQuerySchema = Joi.object({ category_id: id() });

const fields = {
  category_id: id(),
  name: plainText(40),
  logo_id: id().allow(null),
  is_published: Joi.boolean(),
};

const createSkillPayloadSchema = Joi.object({
  ...fields,
  category_id: fields.category_id.required(),
  name: fields.name.required(),
});

const updateSkillPayloadSchema = Joi.object(fields).min(1);

// Urutan berlaku di dalam satu kategori.
const reorderSkillsPayloadSchema = Joi.object({
  category_id: id().required(),
  ids: Joi.array().items(id()).min(1).unique().required(),
});

module.exports = {
  idParamSchema,
  listSkillsQuerySchema,
  createSkillPayloadSchema,
  updateSkillPayloadSchema,
  reorderSkillsPayloadSchema,
};
