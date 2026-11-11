// File gambar yang diunggah admin (logo skill, gambar project, foto profil).
// Menyimpan object key, bukan URL penuh, agar ganti domain/storage tidak merusak data (C5).
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'media',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        kind: {
          type: Sequelize.ENUM('project_image', 'skill_logo', 'profile_photo'),
          allowNull: false,
        },
        object_key: { type: Sequelize.STRING(255), allowNull: false, unique: true },
        mime: { type: Sequelize.STRING(100), allowNull: false },
        size_bytes: { type: Sequelize.INTEGER, allowNull: false },
        width: { type: Sequelize.INTEGER, allowNull: true },
        height: { type: Sequelize.INTEGER, allowNull: true },
        // Varian ukuran hasil konversi, mis. { "400": "project_image/<uuid>-400.webp" }
        variants: { type: Sequelize.JSON, allowNull: true },
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable('media');
  },
};
