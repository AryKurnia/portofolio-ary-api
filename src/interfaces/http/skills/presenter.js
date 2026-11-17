const { toImageResponse } = require('../shared/media');

const toSkillResponse = (skill) => ({
  id: skill.id,
  category_id: skill.categoryId,
  name: skill.name,
  logo_id: skill.logoMediaId,
  logo: toImageResponse(skill.logo),
  is_published: skill.isPublished,
  sort_order: skill.sortOrder,
  created_at: skill.createdAt,
  updated_at: skill.updatedAt,
});

module.exports = { toSkillResponse };
