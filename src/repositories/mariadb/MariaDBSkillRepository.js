const SkillRepository = require('../SkillRepository');
const Skill = require('../../entities/Skill');
const Media = require('../../entities/Media');
const SkillModel = require('../../infrastructure/db/models/Skill');
const reorderBySortOrder = require('./reorderBySortOrder');

const toSkill = (row) => {
  // category hanya dipakai untuk pengurutan (attributes: []), tidak ikut ke entity.
  const { logo, ...data } = row.toJSON();
  delete data.category;
  return new Skill({ ...data, logo: logo ? new Media(logo) : null });
};

const toColumns = (skill) => ({
  categoryId: skill.categoryId,
  name: skill.name,
  logoMediaId: skill.logoMediaId,
  isPublished: skill.isPublished,
  sortOrder: skill.sortOrder,
});

class MariaDBSkillRepository extends SkillRepository {
  constructor(skillModel = SkillModel) {
    super();
    this._model = skillModel;
    this._include = [{ association: 'logo' }, { association: 'category', attributes: [] }];
  }

  async findAll({ categoryId, publishedOnly = false } = {}) {
    const rows = await this._model.findAll({
      include: this._include,
      where: {
        ...(categoryId ? { categoryId } : {}),
        ...(publishedOnly ? { isPublished: true } : {}),
      },
      order: [
        [{ model: this._model.associations.category.target, as: 'category' }, 'sortOrder', 'ASC'],
        ['categoryId', 'ASC'],
        ['sortOrder', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map(toSkill);
  }

  async findById(id) {
    const row = await this._model.findByPk(id, { include: this._include });
    return row ? toSkill(row) : null;
  }

  async findByCategoryAndName(categoryId, name) {
    const row = await this._model.findOne({ include: this._include, where: { categoryId, name } });
    return row ? toSkill(row) : null;
  }

  async countByCategory() {
    const rows = await this._model.findAll({
      attributes: [
        'categoryId',
        [this._model.sequelize.fn('COUNT', this._model.sequelize.col('id')), 'count'],
      ],
      group: ['categoryId'],
      raw: true,
    });
    return Object.fromEntries(rows.map((row) => [row.categoryId, Number(row.count)]));
  }

  async create(skill) {
    const row = await this._model.create(toColumns(skill));
    return this.findById(row.id);
  }

  async update(id, skill) {
    await this._model.update(toColumns(skill), { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(categoryId, orderedIds) {
    await reorderBySortOrder(this._model, orderedIds, { categoryId });
  }
}

module.exports = MariaDBSkillRepository;
