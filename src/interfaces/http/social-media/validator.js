const Joi = require('joi');

const platformParamSchema = Joi.object({
  platform: Joi.string().valid('github', 'linkedin', 'instagram', 'twitter', 'facebook').required(),
})

const updateSocialMediaPayloadSchema = Joi.object({
  url: Joi.string().uri().optional(),
  username: Joi.string().max(100).optional(),
  enabled: Joi.boolean().optional()
})

module.exports = { platformParamSchema, updateSocialMediaPayloadSchema };