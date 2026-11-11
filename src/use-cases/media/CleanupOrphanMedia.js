const removeObjectsQuietly = require('./removeObjectsQuietly');

const DEFAULT_MIN_AGE_HOURS = 24;

// Upload yang tidak pernah dipakai (form dibatalkan) atau yang gambarnya sudah diganti.
class CleanupOrphanMedia {
  constructor({ mediaRepository, fileStorage, logger, now = () => new Date() }) {
    this._mediaRepository = mediaRepository;
    this._fileStorage = fileStorage;
    this._logger = logger;
    this._now = now;
  }

  async execute({ minAgeHours = DEFAULT_MIN_AGE_HOURS } = {}) {
    const createdBefore = new Date(this._now().getTime() - minAgeHours * 60 * 60 * 1000);
    const orphans = await this._mediaRepository.findOrphans(createdBefore);

    for (const media of orphans) {
      await this._mediaRepository.delete(media.id);
      await removeObjectsQuietly(this._fileStorage, this._logger, media.objectKeys, {
        mediaId: media.id,
      });
    }
    return { deleted: orphans.length };
  }
}

module.exports = CleanupOrphanMedia;
