const bcrypt = require('bcrypt');

// ADMIN_USERNAME, ADMIN_EMAIL & ADMIN_PASSWORD dibaca dari .env
// (dimuat oleh config/config.js saat sequelize-cli berjalan).
// Seeder berjalan setelah semua migrasi, termasuk penambahan kolom username.
const BCRYPT_COST = 12;

function requireEnv(name) {
  if (!process.env[name]) throw new Error(`${name} wajib diisi untuk seeder admin`);
  return process.env[name];
}

module.exports = {
  async up(queryInterface) {
    const passwordHash = await bcrypt.hash(requireEnv('ADMIN_PASSWORD'), BCRYPT_COST);

    await queryInterface.bulkInsert('users', [
      {
        username: requireEnv('ADMIN_USERNAME'),
        email: requireEnv('ADMIN_EMAIL'),
        password_hash: passwordHash,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('users', { username: requireEnv('ADMIN_USERNAME') });
  },
};
