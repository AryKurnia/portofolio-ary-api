const Repository = require('./Repository');

// Profile hanya satu baris, jadi tidak butuh id/findAll/delete.
class ProfileRepository extends Repository {
  async get() {
    this._notImplemented('get');
  }

  async update(profile) {
    this._notImplemented('update');
  }
}

module.exports = ProfileRepository;
