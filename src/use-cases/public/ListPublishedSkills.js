// Skill terbit dikelompokkan per kategori (urut sort_order kategori → skill).
// Kategori tanpa skill terbit tidak ditampilkan.
class ListPublishedSkills {
  constructor({ skillRepository, skillCategoryRepository }) {
    this._skillRepository = skillRepository;
    this._skillCategoryRepository = skillCategoryRepository;
  }

  async execute() {
    const [categories, skills] = await Promise.all([
      this._skillCategoryRepository.findAll(),
      this._skillRepository.findAll({ publishedOnly: true }),
    ]);

    return categories
      .map((category) => ({
        category,
        items: skills.filter((skill) => skill.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }
}

module.exports = ListPublishedSkills;
