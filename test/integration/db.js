const sequelize = require('../../src/infrastructure/db/sequelizeClient');

// Pengaman: tes integrasi menghapus data, jadi wajib berjalan di database tes.
const assertTestDatabase = async () => {
  const [[{ db }]] = await sequelize.query('SELECT DATABASE() AS db');
  if (!process.env.DATABASE_TEST_NAME || db !== process.env.DATABASE_TEST_NAME) {
    throw new Error(
      `Tes integrasi menolak berjalan di database "${db}" (bukan DATABASE_TEST_NAME)`
    );
  }
};

const query = async (sql, replacements) => (await sequelize.query(sql, { replacements }))[0];

module.exports = { sequelize, assertTestDatabase, query };
