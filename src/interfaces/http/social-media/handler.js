const container = require('../../../infrastructure/container');
const { toSocialMediaResponse } = require('./presenter');

module.exports = {
  async list(request, h) {
    const result = await container.listSocialMedia.execute();
    return h.response({ data: result.map(toSocialMediaResponse) }).code(200);
  },

  async detail(request, h) {
    const result = await container.getSocialMediaByPlatform.execute(request.params.platform);
    return h.response({ data: toSocialMediaResponse(result) }).code(200);
  },

  async update(request, h) {
    const { url, username, enabled } = request.payload;
    const result = await container.updateSocialMedia.execute(request.params.platform, {
      url,
      username,
      enabled,
    });
    return h.response({ data: toSocialMediaResponse(result) }).code(200);
  },
};
