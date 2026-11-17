const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');

class DeleteSkillCategory {
  constructor(skillCategoryRepository, skillRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
    this._skillRepository = skillRepository;
  }

  async execute(id) {
    const existing = await this._skillCategoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Skill category with id ${id} was not found.`);
    }

    const counts = await this._skillRepository.countByCategory();
    if ((counts[id] ?? 0) > 0) {
      throw new ConflictError('This category still contains skills. Move or delete them first.');
    }
    await this._skillCategoryRepository.delete(id);
  }
}

module.exports = DeleteSkillCategory;
