const { createServer } = require('./server');
const sequelize = require('./infrastructure/db/sequelizeClient');
const logger = require('./infrastructure/logger');

const SHUTDOWN_TIMEOUT_MS = 10000;

const start = async () => {
  const server = await createServer();
  await server.start();
  logger.info(`Server running on ${server.info.uri}`);

  // Berhenti rapi saat container/systemd mengirim sinyal: selesaikan request berjalan, tutup koneksi DB.
  const shutdown = async (signal) => {
    logger.info(`${signal} diterima, menghentikan server...`);
    await server.stop({ timeout: SHUTDOWN_TIMEOUT_MS });
    await sequelize.close();
    process.exit(0);
  };

  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
};

process.on('unhandledRejection', (err) => {
  logger.fatal({ err }, 'Unhandled rejection');
  process.exit(1);
});

start();
