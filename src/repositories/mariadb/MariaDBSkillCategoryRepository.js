const SkillCategoryRepository = require('../SkillCategoryRepository');
const SkillCategory = require('../../entities/SkillCategory');
const SkillCategoryModel = require('../../infrastructure/db/models/SkillCategory');
const reorderBySortOrder = require('./reorderBySortOrder');

const toSkillCategory = (row) => new SkillCategory(row.toJSON());

class MariaDBSkillCategoryRepository extends SkillCategoryRepository {
  constructor(skillCategoryModel = SkillCategoryModel) {
    super();
    this._model = skillCategoryModel;
  }

  async findAll() {
    const rows = await this._model.findAll({
      order: [
        ['sortOrder', 'ASC'],
        ['id', 'ASC'],
      ],
    });
    return rows.map(toSkillCategory);
  }

  async findById(id) {
    const row = await this._model.findByPk(id);
    return row ? toSkillCategory(row) : null;
  }

  async findByName(name) {
    const row = await this._model.findOne({ where: { name } });
    return row ? toSkillCategory(row) : null;
  }

  async create(skillCategory) {
    const row = await this._model.create({
      name: skillCategory.name,
      sortOrder: skillCategory.sortOrder,
    });
    return toSkillCategory(row);
  }

  async update(id, skillCategory) {
    await this._model.update({ name: skillCategory.name }, { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(orderedIds) {
    await reorderBySortOrder(this._model, orderedIds);
  }
}

module.exports = MariaDBSkillCategoryRepository;
