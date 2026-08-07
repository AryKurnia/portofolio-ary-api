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

module.exports = { idParamSchema, listQuerySchema, createSkillPayloadSchema, updateSkillPayloadSchema };