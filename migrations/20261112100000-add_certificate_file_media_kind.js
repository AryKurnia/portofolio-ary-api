// Jenis media baru untuk file sertifikat (PDF/PNG/JPEG/WebP, maks 5 MB).
const KINDS = ['project_image', 'skill_logo', 'profile_photo'];

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('media', 'kind', {
      type: Sequelize.ENUM(...KINDS, 'certificate_file'),
      allowNull: false,
    });
  },

  // Gagal bila masih ada media certificate_file: hapus sertifikat & file-nya dulu.
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('media', 'kind', {
      type: Sequelize.ENUM(...KINDS),
      allowNull: false,
    });
  },
};
