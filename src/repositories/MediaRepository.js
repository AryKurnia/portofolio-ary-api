const Repository = require('./Repository');

class MediaRepository extends Repository {
  async findById(id) {
    this._notImplemented('findById');
  }

  async create(media) {
    this._notImplemented('create');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  // true bila media masih dirujuk (gambar project, foto profil, ...).
  async isReferenced(id) {
    this._notImplemented('isReferenced');
  }

  // Media tanpa rujukan yang dibuat sebelum `createdBefore` (hasil upload yang tidak jadi dipakai).
  async findOrphans(createdBefore) {
    this._notImplemented('findOrphans');
  }
}

module.exports = MediaRepository;
