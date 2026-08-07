const Joi = require('joi');

const loginPayloadSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

module.exports = { loginPayloadSchema };