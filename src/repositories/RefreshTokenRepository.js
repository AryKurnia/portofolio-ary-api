const Repository = require('./Repository');

class RefreshTokenRepository extends Repository {
  async save({ userId, tokenHash, expiresAt }) {
    this._notImplemented('save');
  }

  async findByTokenHash(tokenHash) {
    this._notImplemented('findByTokenHash');
  }

  // Mencabut token lama dan menyimpan penggantinya secara atomik.
  // Mengembalikan false bila token lama ternyata sudah dicabut (dipakai bersamaan/dicuri).
  async rotate({ oldTokenId, userId, tokenHash, expiresAt }) {
    this._notImplemented('rotate');
  }

  async revoke(id) {
    this._notImplemented('revoke');
  }

  async revokeAllForUser(userId) {
    this._notImplemented('revokeAllForUser');
  }
}

module.exports = RefreshTokenRepository;
