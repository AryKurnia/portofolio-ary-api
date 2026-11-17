const container = require('../../../infrastructure/container');
const { toSocialLinkResponse } = require('./presenter');

const toSocialLinkInput = (payload) => ({
  platform: payload.platform,
  label: payload.label,
  url: payload.url,
  isPublished: payload.is_published,
});

module.exports = {
  async list(request, h) {
    const links = await container.listSocialLinks.execute();
    return h.response({ data: links.map(toSocialLinkResponse) }).code(200);
  },

  async create(request, h) {
    const link = await container.createSocialLink.execute(toSocialLinkInput(request.payload));
    return h.response({ data: toSocialLinkResponse(link) }).code(201);
  },

  async update(request, h) {
    const link = await container.updateSocialLink.execute(
      request.params.id,
      toSocialLinkInput(request.payload)
    );
    return h.response({ data: toSocialLinkResponse(link) }).code(200);
  },

  async remove(request, h) {
    await container.deleteSocialLink.execute(request.params.id);
    return h.response().code(204);
  },

  async reorder(request, h) {
    await container.reorderSocialLinks.execute(request.payload.ids);
    return h.response().code(204);
  },
};
