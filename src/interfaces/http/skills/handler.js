const streamConsumers = require('node:stream/consumers');
const Boom = require('@hapi/boom');
const container = require('../../../infrastructure/container');
const { toSkillResponse } = require('./presenter');

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

module.exports = {
  async list(request, h) {
    const { data, meta } = await container.listSkills.execute(request.query);
    return h.response({ data: data.map(toSkillResponse), meta }).code(200);
  },

  async detail(request, h) {
    const skill = await container.getSkill.execute(request.params.id);
    return h.response({ data: toSkillResponse(skill) }).code(200);
  },

  async create(request, h) {
    const skill = await container.createSkill.execute(request.payload);
    return h.response({ data: toSkillResponse(skill) }).code(201);
  },

  async update(request, h) {
    const skill = await container.updateSkill.execute(request.params.id, request.payload);
    return h.response({ data: toSkillResponse(skill) }).code(200);
  },

  async remove(request, h) {
    await container.deleteSkill.execute(request.params.id);
    return h.response().code(204);
  },

  async uploadLogo(request, h) {
    const file = request.payload.logo;
    const mimeType = file.hapi.headers['content-type'];

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      throw Boom.unsupportedMediaType('Use PNG, JPG, WebP or SVG.');
    }

    const buffer = await streamConsumers.buffer(file);

    const skill = await container.uploadSkillLogo.execute({
      id: request.params.id,
      buffer,
      filename: file.hapi.filename,
      mimeType,
    });
    return h.response({ data: toSkillResponse(skill) }).code(200);
  },
};
