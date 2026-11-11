const bcrypt = require('bcrypt');

// ADMIN_EMAIL & ADMIN_PASSWORD dibaca dari .env (dimuat oleh config/config.js saat sequelize-cli berjalan)
const BCRYPT_COST = 12;

function getAdminEmail() {
  if (!process.env.ADMIN_EMAIL) throw new Error('ADMIN_EMAIL wajib diisi untuk seeder admin');
  return process.env.ADMIN_EMAIL;
}

module.exports = {
  async up(queryInterface) {
    if (!process.env.ADMIN_PASSWORD)
      throw new Error('ADMIN_PASSWORD wajib diisi untuk seeder admin');
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, BCRYPT_COST);

    await queryInterface.bulkInsert('users', [
      {
        email: getAdminEmail(),
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { email: getAdminEmail() });
  },
};
