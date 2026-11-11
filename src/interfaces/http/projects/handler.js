const container = require('../../../infrastructure/container');
const { toProjectResponse } = require('./presenter');

const toProjectInput = (payload) => ({
  title: payload.title,
  description: payload.description,
  imageMediaId: payload.image_id,
  linkUrl: payload.link_url,
  showButton: payload.show_button,
  isPublished: payload.is_published,
});

module.exports = {
  async list(request, h) {
    const { data, meta } = await container.listProjects.execute(request.query);
    return h.response({ data: data.map(toProjectResponse), meta }).code(200);
  },

  async detail(request, h) {
    const project = await container.getProject.execute(request.params.id);
    return h.response({ data: toProjectResponse(project) }).code(200);
  },

  async create(request, h) {
    const project = await container.createProject.execute(toProjectInput(request.payload));
    return h.response({ data: toProjectResponse(project) }).code(201);
  },

  async update(request, h) {
    const project = await container.updateProject.execute(
      request.params.id,
      toProjectInput(request.payload)
    );
    return h.response({ data: toProjectResponse(project) }).code(200);
  },

  async remove(request, h) {
    await container.deleteProject.execute(request.params.id);
    return h.response().code(204);
  },

  async reorder(request, h) {
    await container.reorderProjects.execute(request.payload.ids);
    return h.response().code(204);
  },
};
