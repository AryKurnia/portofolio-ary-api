// Tes integrasi: memakai database TES sungguhan (kredensial dari .env, DATABASE_TEST_NAME).
// Jalankan dengan `npm run test:integration`. Tidak ikut `npm test`.
module.exports = {
  testMatch: ['<rootDir>/test/integration/**/*.test.js'],
  setupFiles: ['<rootDir>/test/integration/setupEnv.js'],
  maxWorkers: 1,
};
