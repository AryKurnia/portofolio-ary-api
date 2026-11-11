const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderSkillCategories {
  constructor(skillCategoryRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
  }

  async execute(ids) {
    const categories = await this._skillCategoryRepository.findAll();
    assertCompleteOrder(
      categories.map((category) => category.id),
      ids,
      'skill category'
    );
    await this._skillCategoryRepository.reorder(ids);
  }
}

module.exports = ReorderSkillCategories;
