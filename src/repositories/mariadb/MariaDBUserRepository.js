const UserRepository = require('../UserRepository');
const User = require('../../entities/User');
const UserModel = require('../../infrastructure/db/models/User');

class MariaDBUserRepository extends UserRepository {
  constructor(userModel = UserModel) {
    super();
    this._userModel = userModel;
  }

  async findByEmail(email) {
    const row = await this._userModel.findOne({ where: { email } });
    if (!row) return null;

    const data = row.toJSON();
    return new User({ id: data.id, email: data.email, password: data.passwordHash });
  }
}

module.exports = MariaDBUserRepository;