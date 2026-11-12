const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const removeObjectsQuietly = require('./removeObjectsQuietly');

class DeleteMedia {
  constructor({ mediaRepository, fileStorage, logger }) {
    this._mediaRepository = mediaRepository;
    this._fileStorage = fileStorage;
    this._logger = logger;
  }

  async execute(id) {
    const media = await this._mediaRepository.findById(id);
    if (!media) {
      throw new NotFoundError(`Media with id ${id} was not found.`);
    }
    if (await this._mediaRepository.isReferenced(id)) {
      throw new ConflictError('This file is still used. Replace or remove it there first.');
    }

    // Data dulu, lalu file (best-effort) — sama seperti DeleteSkill.
    await this._mediaRepository.delete(id);
    await removeObjectsQuietly(this._fileStorage, this._logger, media.objectKeys, { mediaId: id });
  }
}

module.exports = DeleteMedia;
