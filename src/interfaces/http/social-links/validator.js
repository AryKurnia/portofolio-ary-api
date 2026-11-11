const Joi = require('joi');
const SocialLink = require('../../../entities/SocialLink');
const { plainText, httpsUrl } = require('../shared/validation');

const fields = {
  platform: Joi.string().valid(...SocialLink.PLATFORMS),
  label: plainText(40).allow(null),
  url: httpsUrl(),
  is_published: Joi.boolean(),
};

const createSocialLinkPayloadSchema = Joi.object({
  ...fields,
  platform: fields.platform.required(),
  url: fields.url.required(),
});

const updateSocialLinkPayloadSchema = Joi.object(fields).min(1);

module.exports = { createSocialLinkPayloadSchema, updateSocialLinkPayloadSchema };
