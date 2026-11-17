// Menghapus media yatim (upload yang tidak dipakai) berumur > MEDIA_ORPHAN_MIN_AGE_HOURS (default 24).
// Jalankan terjadwal, mis. cron harian: `npm run media:cleanup`.
require('../src/assertNodeVersion');

const container = require('../src/infrastructure/container');
const sequelize = require('../src/infrastructure/db/sequelizeClient');
const logger = require('../src/infrastructure/logger');

const minAgeHours = Number(process.env.MEDIA_ORPHAN_MIN_AGE_HOURS ?? 24);

container.cleanupOrphanMedia
  .execute({ minAgeHours })
  .then(({ deleted }) => logger.info({ deleted, minAgeHours }, 'Pembersihan media yatim selesai'))
  .catch((error) => {
    logger.error({ err: error }, 'Pembersihan media yatim gagal');
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
