const Joi = require('joi');

const loginPayloadSchema = Joi.object({
  username: Joi.string().trim().max(50).required(),
  // bcrypt hanya memakai 72 byte pertama; batas ini mencegah payload raksasa.
  password: Joi.string().max(128).required(),
});

module.exports = { loginPayloadSchema };
