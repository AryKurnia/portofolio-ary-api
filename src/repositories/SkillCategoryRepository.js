const Repository = require('./Repository');

class SkillCategoryRepository extends Repository {
  async findAll() {
    this._notImplemented('findAll');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async findByName(name) {
    this._notImplemented('findByName');
  }

  async create(skillCategory) {
    this._notImplemented('create');
  }

  async update(id, skillCategory) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  // sort_order = indeks + 1, dalam satu transaksi.
  async reorder(orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = SkillCategoryRepository;
