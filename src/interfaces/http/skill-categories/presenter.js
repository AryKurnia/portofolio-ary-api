const toSkillCategoryResponse = (category) => ({
  id: category.id,
  name: category.name,
  sort_order: category.sortOrder,
  skill_count: category.skillCount ?? 0,
});

module.exports = { toSkillCategoryResponse };
