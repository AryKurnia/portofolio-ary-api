const Repository = require('./Repository');

class UserRepository extends Repository {
  async findByUsername(username) {
    this._notImplemented('findByUsername');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async updatePasswordHash(id, passwordHash) {
    this._notImplemented('updatePasswordHash');
  }
}

module.exports = UserRepository;
