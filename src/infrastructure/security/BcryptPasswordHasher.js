const bcrypt = require('bcrypt');
const PasswordHasher = require('../../security/PasswordHasher');

const DEFAULT_COST = 12;

class BcryptPasswordHasher extends PasswordHasher {
  constructor({ cost = DEFAULT_COST } = {}) {
    super();
    this._cost = cost;
    this._dummyHashPromise = null;
  }

  async hash(plainPassword) {
    return bcrypt.hash(plainPassword, this._cost);
  }

  async compare(plainPassword, hash) {
    if (!hash) {
      // Samakan durasi dengan login yang username-nya ada (mencegah enumerasi via timing).
      await bcrypt.compare(plainPassword, await this._getDummyHash());
      return false;
    }
    return bcrypt.compare(plainPassword, hash);
  }

  needsRehash(hash) {
    return bcrypt.getRounds(hash) < this._cost;
  }

  _getDummyHash() {
    this._dummyHashPromise ??= bcrypt.hash('dummy-password-untuk-timing', this._cost);
    return this._dummyHashPromise;
  }
}

module.exports = BcryptPasswordHasher;
