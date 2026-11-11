const Repository = require('./Repository');

// Dipakai untuk memastikan media yang dirujuk ada. Upload & penyimpanan menyusul di M4.
class MediaRepository extends Repository {
  async findById(id) {
    this._notImplemented('findById');
  }
}

module.exports = MediaRepository;
