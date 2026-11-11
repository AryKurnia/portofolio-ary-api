const Joi = require('joi');
const { plainText } = require('../shared/validation');

// Minimal satu field: setiap section admin mengirim field miliknya saja.
const updateProfilePayloadSchema = Joi.object({
  greeting: plainText(80),
  tagline: plainText(120),
  about: plainText(1000),
  project_intro: plainText(200).allow(null, ''),
  email: Joi.string().trim().email().max(254),
}).min(1);

module.exports = { updateProfilePayloadSchema };
