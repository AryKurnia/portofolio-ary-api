const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'projects',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        title: { type: Sequelize.STRING(60), allowNull: false },
        description: { type: Sequelize.STRING(300), allowNull: false },
        // Nullable di DB agar draf/seed tanpa gambar bisa disimpan; wajib saat dipublikasikan
        // (divalidasi use-case di M5).
        image_media_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'media', key: 'id' },
          onDelete: 'SET NULL',
        },
        link_url: { type: Sequelize.STRING(2048), allowNull: true },
        show_button: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      },
      TABLE_OPTIONS
    );

    // Tombol "Visit" hanya boleh tampil bila ada link (API.md §3 no. 3).
    await queryInterface.sequelize.query(
      'ALTER TABLE projects ADD CONSTRAINT chk_projects_button_needs_link ' +
        'CHECK (show_button = 0 OR link_url IS NOT NULL)'
    );
    await queryInterface.addIndex('projects', ['is_published', 'sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('projects');
  },
};
