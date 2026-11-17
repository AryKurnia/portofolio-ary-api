const { Op } = require('sequelize');
const MediaRepository = require('../MediaRepository');
const Media = require('../../entities/Media');
const MediaModel = require('../../infrastructure/db/models/Media');

// Semua kolom yang merujuk media. Tambahkan di sini bila ada rujukan baru (mis. logo skill).
const MEDIA_REFERENCES = [
  { table: 'projects', column: 'image_media_id' },
  { table: 'profile', column: 'photo_media_id' },
  { table: 'skills', column: 'logo_media_id' },
  { table: 'certificates', column: 'file_media_id' },
];

// Ditulis eksplisit sebagai SQL: Sequelize membuang NOT secara diam-diam bila Op.not dipakai
// dengan literal (terbukti lewat tes integrasi), jadi jangan diganti dengan Op.not.
const referenceChecks = MEDIA_REFERENCES.map(
  ({ table, column }) => `EXISTS (SELECT 1 FROM ${table} WHERE ${table}.${column} = Media.id)`
);
const isReferencedSql = `(${referenceChecks.join(' OR ')})`;
const notReferencedSql = `NOT ${isReferencedSql}`;

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
      where: { id, [Op.and]: this._model.sequelize.literal(isReferencedSql) },
    });
    return Boolean(row);
  }

  async findOrphans(createdBefore) {
    const rows = await this._model.findAll({
      where: {
        createdAt: { [Op.lt]: createdBefore },
        [Op.and]: this._model.sequelize.literal(notReferencedSql),
      },
    });
    return rows.map(toMedia);
  }
}

MariaDBMediaRepository.MEDIA_REFERENCES = MEDIA_REFERENCES;

module.exports = MariaDBMediaRepository;
