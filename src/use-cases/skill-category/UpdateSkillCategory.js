const SkillCategory = require('../../entities/SkillCategory');
const NotFoundError = require('../../exceptions/NotFoundError');
const { duplicateNameError } = require('./CreateSkillCategory');

class UpdateSkillCategory {
  constructor(skillCategoryRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
  }

  async execute(id, { name }) {
    const existing = await this._skillCategoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Skill category with id ${id} was not found.`);
    }

    const duplicate = await this._skillCategoryRepository.findByName(name);
    if (duplicate && duplicate.id !== id) {
      throw duplicateNameError();
    }

    return this._skillCategoryRepository.update(id, new SkillCategory({ ...existing, name }));
  }
}

module.exports = UpdateSkillCategory;
