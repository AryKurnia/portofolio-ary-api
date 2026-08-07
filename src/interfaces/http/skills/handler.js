const streamConsumers = require('node:stream/consumers');
const container = require('../../../infrastructure/container');
const NotFoundError = require('../../../exceptions/NotFoundError');

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

function errorResponse(h, statusCode, message) {
  return h.response({ statusCode, error: statusCode === 404 ? 'Not Found' : 'Bad Request', message }).code(statusCode);
}

module.exports = {
  async list(request, h) {
    const result = await container.listSkills.execute(request.query);
    return h.response(result).code(200);
  },

  async detail(request, h) {
    const skill = await container.skillRepository.findById(request.params.id);
    if (!skill) return errorResponse(h, 404, `Skill dengan id ${request.params.id} tidak ditemukan`);
    return h.response(skill).code(200);
  },

  async create(request, h) {
    const skill = await container.createSkill.execute(request.payload);
    return h.response(skill).code(201);
  },

  async update(request, h) {
    try {
      const skill = await container.updateSkill.execute(request.params.id, request.payload);
      return h.response(skill).code(200);
    } catch (err) {
      if (err instanceof NotFoundError) return errorResponse(h, 404, err.message);
      throw err;
    }
  },

  async remove(request, h) {
    try {
      await container.deleteSkill.execute(request.params.id);
      return h.response().code(204);
    } catch (err) {
      if (err instanceof NotFoundError) return errorResponse(h, 404, err.message);
      throw err;
    }
  },

  async uploadLogo(request, h) {
    const file = request.payload.logo;
    const mimeType = file.hapi.headers['content-type'];

    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return errorResponse(h, 422, `Tipe file ${mimeType} tidak diizinkan`);
    }

    const buffer = await streamConsumers.buffer(file);

    try {
      const skill = await container.uploadSkillLogo.execute({
        id: request.params.id,
        buffer,
        filename: file.hapi.filename,
        mimeType,
      });
      return h.response(skill).code(200);
    } catch (err) {
      if (err instanceof NotFoundError) return errorResponse(h, 404, err.message);
      throw err;
    }
  },
};