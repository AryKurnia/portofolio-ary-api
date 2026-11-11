const toSkillCategoryResponse = (category) => ({
  id: category.id,
  name: category.name,
  sort_order: category.sortOrder,
});

module.exports = { toSkillCategoryResponse };
