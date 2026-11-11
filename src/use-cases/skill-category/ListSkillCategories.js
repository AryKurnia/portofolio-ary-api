class ListSkillCategories {
  constructor(skillCategoryRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
  }

  async execute() {
    return this._skillCategoryRepository.findAll();
  }
}

module.exports = ListSkillCategories;
