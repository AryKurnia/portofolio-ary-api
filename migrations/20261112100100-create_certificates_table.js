// Sertifikat (section #certificates). Tanggal disimpan sebagai DATE tanggal 1, API memakai
// 'YYYY-MM' — sama seperti positions.
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'certificates',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: Sequelize.STRING(150), allowNull: false },
        issuer: { type: Sequelize.STRING(100), allowNull: false },
        issued_at: { type: Sequelize.DATEONLY, allowNull: false },
        // NULL = tidak kedaluwarsa.
        expires_at: { type: Sequelize.DATEONLY, allowNull: true },
        credential_id: { type: Sequelize.STRING(100), allowNull: true },
        credential_url: { type: Sequelize.STRING(2048), allowNull: true },
        file_media_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'media', key: 'id' },
          onDelete: 'SET NULL',
        },
        is_published: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
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

    // Aturan lain divalidasi di use-case:
    // - "tanggal terbit tidak di masa depan" butuh waktu sekarang;
    // - "terbit wajib punya file atau credential_url": MariaDB menolak CHECK pada kolom FK
    //   yang punya ON DELETE SET NULL (file_media_id).
    await queryInterface.sequelize.query(
      'ALTER TABLE certificates ADD CONSTRAINT chk_certificates_period_order ' +
        'CHECK (expires_at IS NULL OR expires_at >= issued_at)'
    );
    await queryInterface.addIndex('certificates', ['is_published', 'sort_order']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('certificates');
  },
};
