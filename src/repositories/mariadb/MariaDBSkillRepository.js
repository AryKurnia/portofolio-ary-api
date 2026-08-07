const SkillRepository = require('../SkillRepository');
const Skill = require('../../entities/Skill');
const SkillModel = require('../../infrastructure/db/models/Skill');

class MariaDBSkillRepository extends SkillRepository {
  constructor(skillModel = SkillModel) {
    super();
    this._skillModel = skillModel;
  }

  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const { rows, count } = await this._skillModel.findAndCountAll({ offset, limit });

    return {
      data: rows.map((row) => new Skill(row.toJSON())),
      meta: { page, limit, total: count },
    };
  }

  async findById(id) {
    const row = await this._skillModel.findByPk(id);
    return row ? new Skill(row.toJSON()) : null;
  }

  async save(skill) {
    const row = await this._skillModel.create({
      name: skill.name,
      logoUrl: skill.logoUrl,
      description: skill.description,
      enabled: skill.enabled,
    });
    return new Skill(row.toJSON());
  }

  async update(id, skill) {
    await this._skillModel.update(
      { name: skill.name, logoUrl: skill.logoUrl, description: skill.description, enabled: skill.enabled },
      { where: { id } }
    );
    const row = await this._skillModel.findByPk(id);
    return new Skill(row.toJSON());
  }

  async delete(id) {
    await this._skillModel.destroy({ where: { id } });
  }
}

module.exports = MariaDBSkillRepository;