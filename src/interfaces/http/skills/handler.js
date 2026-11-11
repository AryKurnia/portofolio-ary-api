const container = require('../../../infrastructure/container');
const { toSkillResponse } = require('./presenter');

const toSkillInput = (payload) => ({
  categoryId: payload.category_id,
  name: payload.name,
  logoMediaId: payload.logo_id,
  isPublished: payload.is_published,
});

module.exports = {
  async list(request, h) {
    const skills = await container.listSkills.execute({ categoryId: request.query.category_id });
    return h.response({ data: skills.map(toSkillResponse) }).code(200);
  },

  async detail(request, h) {
    const skill = await container.getSkill.execute(request.params.id);
    return h.response({ data: toSkillResponse(skill) }).code(200);
  },

  async create(request, h) {
    const skill = await container.createSkill.execute(toSkillInput(request.payload));
    return h.response({ data: toSkillResponse(skill) }).code(201);
  },

  async update(request, h) {
    const skill = await container.updateSkill.execute(
      request.params.id,
      toSkillInput(request.payload)
    );
    return h.response({ data: toSkillResponse(skill) }).code(200);
  },

  async remove(request, h) {
    await container.deleteSkill.execute(request.params.id);
    return h.response().code(204);
  },

  async reorder(request, h) {
    await container.reorderSkills.execute(request.payload.category_id, request.payload.ids);
    return h.response().code(204);
  },
};
