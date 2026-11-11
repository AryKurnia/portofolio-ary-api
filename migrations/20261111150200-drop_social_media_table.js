// social_media digantikan social_links (data sudah disalin di migrasi sebelumnya).
// down membuat ulang tabel lama dan menyalin data kembali (username diisi nama platform).
module.exports = {
  async up(queryInterface) {
    await queryInterface.dropTable('social_media');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.createTable('social_media', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      platform: { type: Sequelize.STRING, allowNull: false, unique: true },
      url: { type: Sequelize.STRING, allowNull: false },
      username: { type: Sequelize.STRING, allowNull: false },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    });
    // Urutan dipertahankan (sort_order → id). Platform di social_media unik, jadi bila ada
    // beberapa link dengan platform sama, hanya yang pertama yang dibawa (INSERT IGNORE).
    await queryInterface.sequelize.query(`
      INSERT IGNORE INTO social_media (platform, url, username, enabled, created_at, updated_at)
      SELECT CASE platform WHEN 'x' THEN 'twitter' ELSE platform END, url,
             COALESCE(label, platform), is_published, created_at, updated_at
      FROM social_links
      ORDER BY sort_order, id
    `);
  },
};
