// Pengganti social_media (API.md §2.3): punya urutan, label, dan bisa ditambah/hapus.
// Data lama disalin: platform di-lowercase ('linkedIn' → 'linkedin'), twitter → x,
// enabled → is_published, urutan mengikuti id. Kolom username tidak dibawa (label default
// diambil dari nama platform).
const TABLE_OPTIONS = { charset: 'utf8mb4', collate: 'utf8mb4_uca1400_ai_ci' };
const PLATFORMS = ['github', 'facebook', 'instagram', 'linkedin', 'discord', 'x', 'other'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'social_links',
      {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        platform: { type: Sequelize.ENUM(...PLATFORMS), allowNull: false },
        label: { type: Sequelize.STRING(40), allowNull: true },
        url: { type: Sequelize.STRING(2048), allowNull: false },
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
    await queryInterface.addIndex('social_links', ['sort_order']);

    const knownPlatforms = PLATFORMS.map((platform) => `'${platform}'`).join(', ');
    await queryInterface.sequelize.query(`
      INSERT INTO social_links (platform, label, url, is_published, sort_order, created_at, updated_at)
      SELECT
        CASE
          WHEN LOWER(platform) = 'twitter' THEN 'x'
          WHEN LOWER(platform) IN (${knownPlatforms}) THEN LOWER(platform)
          ELSE 'other'
        END,
        NULL, url, enabled, ROW_NUMBER() OVER (ORDER BY id), created_at, updated_at
      FROM social_media
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('social_links');
  },
};
