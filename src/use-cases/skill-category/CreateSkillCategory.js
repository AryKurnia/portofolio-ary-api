const SkillCategory = require('../../entities/SkillCategory');
const ConflictError = require('../../exceptions/ConflictError');

const duplicateNameError = () =>
  new ConflictError('A skill category with this name already exists.', [
    { field: 'name', message: 'Name is already used.' },
  ]);

class CreateSkillCategory {
  constructor(skillCategoryRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
  }

  // Kategori baru ditaruh paling akhir.
  async execute({ name }) {
    if (await this._skillCategoryRepository.findByName(name)) {
      throw duplicateNameError();
    }

    const categories = await this._skillCategoryRepository.findAll();
    const lastOrder = Math.max(0, ...categories.map((category) => category.sortOrder));
    return this._skillCategoryRepository.create(
      new SkillCategory({ name, sortOrder: lastOrder + 1 })
    );
  }
}

CreateSkillCategory.duplicateNameError = duplicateNameError;

module.exports = CreateSkillCategory;
