const Repository = require('./Repository');

class SkillRepository extends Repository {
  // Urut kategori (sort_order) → skill (sort_order). Bisa difilter per kategori / hanya yang terbit.
  async findAll({ categoryId, publishedOnly } = {}) {
    this._notImplemented('findAll');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async findByCategoryAndName(categoryId, name) {
    this._notImplemented('findByCategoryAndName');
  }

  // → { [categoryId]: jumlah skill }
  async countByCategory() {
    this._notImplemented('countByCategory');
  }

  async create(skill) {
    this._notImplemented('create');
  }

  async update(id, skill) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  async reorder(categoryId, orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = SkillRepository;
