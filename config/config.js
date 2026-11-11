// Dipakai oleh sequelize-cli (migrasi/seeder) dan src/infrastructure/db/sequelizeClient.js.
require('dotenv').config({ quiet: true });

const base = {
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  host: process.env.DATABASE_HOST,
  dialect: 'mysql',
  seederStorage: 'sequelize',
};

module.exports = {
  development: {
    ...base,
    database: process.env.DATABASE_NAME,
  },
  test: {
    ...base,
    database: process.env.DATABASE_TEST_NAME,
  },
  production: {
    ...base,
    database: process.env.DATABASE_NAME,
  },
};
