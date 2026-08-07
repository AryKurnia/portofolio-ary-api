const Repository = require('./Repository');

// dibutuhkan untuk /auth/login
class UserRepository extends Repository {
  async findByEmail(email) { this._notImplemented('findByEmail'); }
}

module.exports = UserRepository;