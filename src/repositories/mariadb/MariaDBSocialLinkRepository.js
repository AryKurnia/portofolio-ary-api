const SocialLinkRepository = require('../SocialLinkRepository');
const SocialLink = require('../../entities/SocialLink');
const SocialLinkModel = require('../../infrastructure/db/models/SocialLink');
const reorderBySortOrder = require('./reorderBySortOrder');

const toSocialLink = (row) => new SocialLink(row.toJSON());

const toColumns = (link) => ({
  platform: link.platform,
  label: link.label,
  url: link.url,
  isPublished: link.isPublished,
  sortOrder: link.sortOrder,
});

class MariaDBSocialLinkRepository extends SocialLinkRepository {
  constructor(socialLinkModel = SocialLinkModel) {
    super();
    this._model = socialLinkModel;
  }

  async findAll({ publishedOnly = false } = {}) {
    const rows = await this._model.findAll({
      where: publishedOnly ? { isPublished: true } : {},
      order: [
        ['sortOrder', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map(toSocialLink);
  }

  async findById(id) {
    const row = await this._model.findByPk(id);
    return row ? toSocialLink(row) : null;
  }

  async create(link) {
    const row = await this._model.create(toColumns(link));
    return toSocialLink(row);
  }

  async update(id, link) {
    await this._model.update(toColumns(link), { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(orderedIds) {
    await reorderBySortOrder(this._model, orderedIds);
  }
}

module.exports = MariaDBSocialLinkRepository;
