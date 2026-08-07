const Repository = require('./Repository');

class SkillRepository extends Repository {
  async findAll({ page, limit } = {}) { this._notImplemented('findAll'); }
  async findById(id) { this._notImplemented('findById'); }
  async save(skill) { this._notImplemented('save'); }
  async update(id, skill) { this._notImplemented('update'); }
  async delete(id) { this._notImplemented('delete'); }
}

module.exports = SkillRepository;
