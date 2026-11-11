const Repository = require('./Repository');

class PositionRepository extends Repository {
  async findById(id) {
    this._notImplemented('findById');
  }

  async create(position) {
    this._notImplemented('create');
  }

  async update(id, position) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  // Menyimpan urutan baru (sort_order = indeks + 1) dalam satu transaksi.
  async reorder(organizationId, orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = PositionRepository;
