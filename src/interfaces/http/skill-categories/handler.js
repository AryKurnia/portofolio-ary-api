const container = require('../../../infrastructure/container');
const { toSkillCategoryResponse } = require('./presenter');

module.exports = {
  async list(request, h) {
    const categories = await container.listSkillCategories.execute();
    return h.response({ data: categories.map(toSkillCategoryResponse) }).code(200);
  },

  async create(request, h) {
    const category = await container.createSkillCategory.execute(request.payload);
    return h.response({ data: toSkillCategoryResponse(category) }).code(201);
  },

  async update(request, h) {
    const category = await container.updateSkillCategory.execute(
      request.params.id,
      request.payload
    );
    return h.response({ data: toSkillCategoryResponse(category) }).code(200);
  },

  async remove(request, h) {
    await container.deleteSkillCategory.execute(request.params.id);
    return h.response().code(204);
  },

  async reorder(request, h) {
    await container.reorderSkillCategories.execute(request.payload.ids);
    return h.response().code(204);
  },
};
