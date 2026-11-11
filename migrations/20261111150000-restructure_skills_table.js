// Skill dikaitkan ke kategori, punya urutan dan logo (media). M5 bagian 3.
// - Skill yang sudah ada dimasukkan ke kategori pertama (urut sort_order).
// - enabled → is_published; skill tanpa logo tidak terbit (aturan: skill terbit wajib punya logo).
// - description (K14) dan logo_url dihapus. logo_url TIDAK dimigrasikan ke media: format lama
//   menyimpan URL penuh dan objeknya tidak ada lagi di bucket (diperiksa 11 Nov 2026).
// - down tidak bisa memulihkan status enabled lama untuk skill tanpa logo (sengaja diturunkan).
module.exports = {
  async up(queryInterface, Sequelize) {
    const [[{ skillCount }]] = await queryInterface.sequelize.query(
      'SELECT COUNT(*) AS skillCount FROM skills'
    );
    const [[firstCategory]] = await queryInterface.sequelize.query(
      'SELECT id FROM skill_categories ORDER BY sort_order, id LIMIT 1'
    );
    if (Number(skillCount) > 0 && !firstCategory) {
      throw new Error(
        'Ada skill tetapi belum ada skill_categories; jalankan seeder kategori dulu.'
      );
    }

    await queryInterface.addColumn('skills', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'id',
      references: { model: 'skill_categories', key: 'id' },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });
    if (firstCategory) {
      await queryInterface.sequelize.query(
        'UPDATE skills SET category_id = ? WHERE category_id IS NULL',
        {
          replacements: [firstCategory.id],
        }
      );
    }
    await queryInterface.changeColumn('skills', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn('skills', 'sort_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'name',
    });
    await queryInterface.addColumn('skills', 'logo_media_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'sort_order',
      references: { model: 'media', key: 'id' },
      onDelete: 'SET NULL',
    });

    await queryInterface.renameColumn('skills', 'enabled', 'is_published');
    await queryInterface.sequelize.query(
      'UPDATE skills SET is_published = 0 WHERE logo_media_id IS NULL'
    );

    await queryInterface.removeColumn('skills', 'description');
    await queryInterface.removeColumn('skills', 'logo_url');

    await queryInterface.changeColumn('skills', 'name', {
      type: Sequelize.STRING(40),
      allowNull: false,
    });
    await queryInterface.addIndex('skills', ['category_id', 'name'], {
      name: 'skills_category_name_unique',
      unique: true,
    });
    await queryInterface.addIndex('skills', ['category_id', 'sort_order'], {
      name: 'skills_category_sort',
    });
  },

  async down(queryInterface, Sequelize) {
    // FK category_id dilepas lebih dulu: MariaDB memakai index unik (category_id, name) untuk FK
    // tersebut (index otomatis FK dihapus saat index lain bisa dipakai), sehingga index itu
    // tidak bisa dihapus selama FK masih ada.
    const [foreignKeys] = await queryInterface.sequelize.query(
      `SELECT CONSTRAINT_NAME AS name FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'skills' AND COLUMN_NAME = 'category_id'
         AND REFERENCED_TABLE_NAME IS NOT NULL`
    );
    for (const { name } of foreignKeys) {
      await queryInterface.removeConstraint('skills', name);
    }
    await queryInterface.removeIndex('skills', 'skills_category_sort');
    await queryInterface.removeIndex('skills', 'skills_category_name_unique');
    await queryInterface.changeColumn('skills', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('skills', 'logo_url', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('skills', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.renameColumn('skills', 'is_published', 'enabled');
    await queryInterface.removeColumn('skills', 'logo_media_id');
    await queryInterface.removeColumn('skills', 'sort_order');
    await queryInterface.removeColumn('skills', 'category_id');
  },
};
