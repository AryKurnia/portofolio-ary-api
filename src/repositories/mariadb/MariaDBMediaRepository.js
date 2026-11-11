const { Op } = require('sequelize');
const MediaRepository = require('../MediaRepository');
const Media = require('../../entities/Media');
const MediaModel = require('../../infrastructure/db/models/Media');

// Semua kolom yang merujuk media. Tambahkan di sini bila ada rujukan baru (mis. logo skill).
const MEDIA_REFERENCES = [
  { table: 'projects', column: 'image_media_id' },
  { table: 'profile', column: 'photo_media_id' },
];

const notReferenced = MEDIA_REFERENCES.map(
  ({ table, column }) => `NOT EXISTS (SELECT 1 FROM ${table} WHERE ${table}.${column} = Media.id)`
).join(' AND ');

const toMedia = (row) => new Media(row.toJSON());

class MariaDBMediaRepository extends MediaRepository {
  constructor(mediaModel = MediaModel) {
    super();
    this._model = mediaModel;
  }

  async findById(id) {
    const row = await this._model.findByPk(id);
    return row ? toMedia(row) : null;
  }

  async create(media) {
    const row = await this._model.create({
      kind: media.kind,
      objectKey: media.objectKey,
      mime: media.mime,
      sizeBytes: media.sizeBytes,
      width: media.width,
      height: media.height,
      variants: media.variants,
    });
    return this.findById(row.id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async isReferenced(id) {
    const row = await this._model.findOne({
      attributes: ['id'],
      where: { id, [Op.not]: this._model.sequelize.literal(notReferenced) },
    });
    return Boolean(row);
  }

  async findOrphans(createdBefore) {
    const rows = await this._model.findAll({
      where: {
        createdAt: { [Op.lt]: createdBefore },
        [Op.and]: this._model.sequelize.literal(notReferenced),
      },
    });
    return rows.map(toMedia);
  }
}

MariaDBMediaRepository.MEDIA_REFERENCES = MEDIA_REFERENCES;

module.exports = MariaDBMediaRepository;
