const Repository = require('./Repository');

class ProjectRepository extends Repository {
  // Urut sort_order ASC, lalu created_at DESC. → { data, meta: { page, limit, total } }
  async findAll({ page, limit } = {}) {
    this._notImplemented('findAll');
  }

  async findAllIds() {
    this._notImplemented('findAllIds');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async create(project) {
    this._notImplemented('create');
  }

  async update(id, project) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  async reorder(orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = ProjectRepository;
