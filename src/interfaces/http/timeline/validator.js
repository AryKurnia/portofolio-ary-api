const Joi = require('joi');
const Organization = require('../../../entities/Organization');
const Position = require('../../../entities/Position');
const { plainText, yearMonth } = require('../shared/validation');

const group = () => Joi.string().valid(...Organization.GROUPS);

const listOrganizationsQuerySchema = Joi.object({ group: group() });

const createOrganizationPayloadSchema = Joi.object({
  name: plainText(120).required(),
  group: group().required(),
  location: plainText(80).allow(null),
});

// group sengaja tidak bisa diubah (posisi terikat aturan tipe per grup).
const updateOrganizationPayloadSchema = Joi.object({
  name: plainText(120),
  location: plainText(80).allow(null),
}).min(1);

const positionFields = {
  title: plainText(120),
  type: Joi.string().valid(...Position.TYPES),
  event_name: plainText(120).allow(null),
  start_date: yearMonth(),
  end_date: yearMonth().allow(null),
  is_current: Joi.boolean(),
  description: plainText(500).allow(null),
};

// organization_id ATAU (organization_name + group).
const createPositionPayloadSchema = Joi.object({
  organization_id: Joi.number().integer().positive(),
  organization_name: plainText(120),
  group: group(),
  ...positionFields,
  title: positionFields.title.required(),
  type: positionFields.type.required(),
  start_date: positionFields.start_date.required(),
})
  .xor('organization_id', 'organization_name')
  .with('organization_name', 'group')
  .without('organization_id', 'group');

const updatePositionPayloadSchema = Joi.object(positionFields).min(1);

module.exports = {
  listOrganizationsQuerySchema,
  createOrganizationPayloadSchema,
  updateOrganizationPayloadSchema,
  createPositionPayloadSchema,
  updatePositionPayloadSchema,
};
