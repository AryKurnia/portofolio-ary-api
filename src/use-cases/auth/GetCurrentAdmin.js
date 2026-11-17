const UnauthorizedError = require('../../exceptions/UnauthorizedError');

class GetCurrentAdmin {
  constructor(userRepository) {
    this._userRepository = userRepository;
  }

  async execute(userId) {
    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Account no longer exists.');
    }
    return { id: user.id, username: user.username };
  }
}

module.exports = GetCurrentAdmin;
