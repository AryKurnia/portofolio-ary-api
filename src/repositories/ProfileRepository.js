const Repository = require('./Repository');

// Profile cuma single row, jadi tidak butuh id/findAll/delete
class ProfileRepository extends Repository {
  async get() { this._notImplemented('get'); }
  async update(profile) { this._notImplemented('update'); }
}

module.exports = ProfileRepository;
