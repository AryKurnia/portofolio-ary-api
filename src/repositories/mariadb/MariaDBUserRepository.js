const UserRepository = require('../UserRepository');
const User = require('../../entities/User');
const UserModel = require('../../infrastructure/db/models/User');

const toUser = (row) => {
  const data = row.toJSON();
  return new User({
    id: data.id,
    username: data.username,
    email: data.email,
    password: data.passwordHash,
  });
};

class MariaDBUserRepository extends UserRepository {
  constructor(userModel = UserModel) {
    super();
    this._userModel = userModel;
  }

  async findByUsername(username) {
    const row = await this._userModel.findOne({ where: { username } });
    return row ? toUser(row) : null;
  }

  async findById(id) {
    const row = await this._userModel.findByPk(id);
    return row ? toUser(row) : null;
  }

  async updatePasswordHash(id, passwordHash) {
    await this._userModel.update({ passwordHash }, { where: { id } });
  }
}

module.exports = MariaDBUserRepository;
