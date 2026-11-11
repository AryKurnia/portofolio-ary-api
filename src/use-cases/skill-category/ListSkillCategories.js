// Setiap kategori dilengkapi skillCount (ditampilkan di admin; DELETE ditolak bila > 0).
class ListSkillCategories {
  constructor(skillCategoryRepository, skillRepository) {
    this._skillCategoryRepository = skillCategoryRepository;
    this._skillRepository = skillRepository;
  }

  async execute() {
    const [categories, counts] = await Promise.all([
      this._skillCategoryRepository.findAll(),
      this._skillRepository.countByCategory(),
    ]);
    return categories.map((category) => ({ ...category, skillCount: counts[category.id] ?? 0 }));
  }
}

module.exports = ListSkillCategories;
