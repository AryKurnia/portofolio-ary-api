'use strict';

// Sejak M5 bagian 3 tautan sosial disimpan di tabel social_links (social_media sudah dihapus
// oleh migrasi). Seeder ini hanya berjalan pada instalasi baru, setelah semua migrasi.
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert(
      'social_links',
      [
        { platform: 'instagram', url: 'https://instagram.com/aryk922/', is_published: true },
        { platform: 'linkedin', url: 'https://www.linkedin.com/in/arykurnia/', is_published: true },
        { platform: 'github', url: 'https://github.com/AryKurnia', is_published: true },
        {
          platform: 'facebook',
          url: 'https://www.facebook.com/ary.kurnia.922',
          is_published: true,
        },
        { platform: 'x', url: 'https://x.com/AryK922', is_published: false },
      ].map((link, index) => ({
        ...link,
        label: null,
        sort_order: index + 1,
        created_at: now,
        updated_at: now,
      }))
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('social_links', null, {});
  },
};
