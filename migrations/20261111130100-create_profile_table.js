// Profil pemilik portofolio — selalu tepat satu baris (id = 1).
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'profile',
      {
        id: { type: Sequelize.TINYINT.UNSIGNED, primaryKey: true, defaultValue: 1 },
        greeting: { type: Sequelize.STRING(80), allowNull: false },
        tagline: { type: Sequelize.STRING(120), allowNull: false },
        about: { type: Sequelize.TEXT, allowNull: false },
        project_intro: { type: Sequelize.STRING(200), allowNull: true },
        email: { type: Sequelize.STRING(254), allowNull: false },
        photo_media_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'media', key: 'id' },
          onDelete: 'SET NULL',
        },
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

    await queryInterface.sequelize.query(
      'ALTER TABLE profile ADD CONSTRAINT chk_profile_singleton CHECK (id = 1)'
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('profile');
  },
};
