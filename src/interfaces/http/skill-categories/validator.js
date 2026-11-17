const Joi = require('joi');
const { plainText } = require('../shared/validation');

const skillCategoryPayloadSchema = Joi.object({ name: plainText(40).required() });

module.exports = { skillCategoryPayloadSchema };
