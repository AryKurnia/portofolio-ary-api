// Skill dari desain (API.md §11). Belum terbit sampai logonya diunggah lewat admin
// (aturan: skill terbit wajib punya logo).
const SKILLS = {
  Frontend: ['HTML5', 'CSS3', 'JavaScript'],
  Backend: ['Node.js', 'hapi'],
};

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    for (const [categoryName, names] of Object.entries(SKILLS)) {
      const [[category]] = await queryInterface.sequelize.query(
        'SELECT id FROM skill_categories WHERE name = ?',
        {
          replacements: [categoryName],
        }
      );
      if (!category)
        throw new Error(`Kategori skill "${categoryName}" belum ada; jalankan seeder konten dulu.`);

      await queryInterface.bulkInsert(
        'skills',
        names.map((name, index) => ({
          category_id: category.id,
          name,
          sort_order: index + 1,
          is_published: false,
          created_at: now,
          updated_at: now,
        }))
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('skills', { name: Object.values(SKILLS).flat() });
  },
};
