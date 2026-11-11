const MediaRepository = require('../MediaRepository');
const MediaModel = require('../../infrastructure/db/models/Media');

class MariaDBMediaRepository extends MediaRepository {
  constructor(mediaModel = MediaModel) {
    super();
    this._model = mediaModel;
  }

  async findById(id) {
    const row = await this._model.findByPk(id);
    return row ? row.toJSON() : null;
  }
}

module.exports = MariaDBMediaRepository;
