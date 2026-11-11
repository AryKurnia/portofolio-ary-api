const NotFoundError = require('../../exceptions/NotFoundError');

// Penolakan 409 bila kategori masih berisi skill ditambahkan saat skills.category_id ada (M5 bagian 3).
class DeleteSkillCategory {
  constructor(skillCategoryRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
  }

  async execute(id) {
    const existing = await this._skillCategoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Skill category with id ${id} was not found.`);
    }
    await this._skillCategoryRepository.delete(id);
  }
}

module.exports = DeleteSkillCategory;
