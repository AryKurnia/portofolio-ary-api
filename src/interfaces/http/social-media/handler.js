const streamConsumers = require('node:stream/consumers');
const container = require('../../../infrastructure/container');
const NotFoundError = require('../../../exceptions/NotFoundError');

const Boom = require('@hapi/boom')

module.exports = {
  async list(request, h) {
    const result = await container.listSocialMedia.execute();
    return h.response(result).code(200);
  },

  async detail(request, h) {
    const platform = request.params.platform;

    const result = await container.getSocialMediaByPlatform.execute(platform);
    if (!result) throw new NotFoundError(`Social media dengan platform ${platform} tidak ditemukan`);
    return h.response(result).code(200);
  },

  async update(request, h) {
    const platform = request.params.platform;
    const { url, username, enabled } = request.payload;

    const result = await container.updateSocialMedia.execute(platform, { url, username, enabled });

    if (!result) throw new NotFoundError(`Social media dengan platform ${platform} tidak ditemukan`);
    return h.response(result).code(200);
  }
}