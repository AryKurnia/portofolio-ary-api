const Repository = require('./Repository');

class ProjectRepository extends Repository {
  async findAll({ page, limit } = {}) { this._notImplemented('findAll'); }
  async findById(id) { this._notImplemented('findById'); }
  async save(project) { this._notImplemented('save'); }
  async update(id, project) { this._notImplemented('update'); }
  async delete(id) { this._notImplemented('delete'); }
}

module.exports = ProjectRepository;
