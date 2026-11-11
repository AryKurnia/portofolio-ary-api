const NotFoundError = require('../../exceptions/NotFoundError');
const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderSkills {
  constructor({ skillRepository, skillCategoryRepository }) {
    this._skillRepository = skillRepository;
    this._skillCategoryRepository = skillCategoryRepository;
  }

  // Urutan berlaku di dalam satu kategori (API.md §7.3).
  async execute(categoryId, ids) {
    if (!(await this._skillCategoryRepository.findById(categoryId))) {
      throw new NotFoundError(`Skill category with id ${categoryId} was not found.`);
    }
    const skills = await this._skillRepository.findAll({ categoryId });
    assertCompleteOrder(
      skills.map((skill) => skill.id),
      ids,
      'skill of this category'
    );
    await this._skillRepository.reorder(categoryId, ids);
  }
}

module.exports = ReorderSkills;
