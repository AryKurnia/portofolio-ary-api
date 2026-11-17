const Repository = require('./Repository');

class CertificateRepository extends Repository {
  // Urut sort_order ASC, lalu id ASC. publishedOnly: hanya is_published = true (halaman publik).
  async findAll({ publishedOnly } = {}) {
    this._notImplemented('findAll');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async create(certificate) {
    this._notImplemented('create');
  }

  async update(id, certificate) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  async reorder(orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = CertificateRepository;
