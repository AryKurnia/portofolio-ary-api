const RefreshTokenRepository = require('../RefreshTokenRepository');
const RefreshToken = require('../../entities/RefreshToken');
const RefreshTokenModel = require('../../infrastructure/db/models/RefreshToken');

const toRefreshToken = (row) => new RefreshToken(row.toJSON());

class MariaDBRefreshTokenRepository extends RefreshTokenRepository {
  constructor(refreshTokenModel = RefreshTokenModel) {
    super();
    this._model = refreshTokenModel;
  }

  async save({ userId, tokenHash, expiresAt }) {
    const row = await this._model.create({ userId, tokenHash, expiresAt });
    return toRefreshToken(row);
  }

  async findByTokenHash(tokenHash) {
    const row = await this._model.findOne({ where: { tokenHash } });
    return row ? toRefreshToken(row) : null;
  }

  async rotate({ oldTokenId, userId, tokenHash, expiresAt }) {
    return this._model.sequelize.transaction(async (transaction) => {
      // Cabut hanya bila belum dicabut: dua refresh bersamaan dengan token sama → satu gagal.
      const [revokedCount] = await this._model.update(
        { revokedAt: new Date() },
        { where: { id: oldTokenId, revokedAt: null }, transaction }
      );
      if (revokedCount === 0) return false;

      const replacement = await this._model.create(
        { userId, tokenHash, expiresAt },
        { transaction }
      );
      await this._model.update(
        { replacedById: replacement.id },
        { where: { id: oldTokenId }, transaction }
      );
      return true;
    });
  }

  async revoke(id) {
    await this._model.update({ revokedAt: new Date() }, { where: { id, revokedAt: null } });
  }

  async revokeAllForUser(userId) {
    await this._model.update({ revokedAt: new Date() }, { where: { userId, revokedAt: null } });
  }
}

module.exports = MariaDBRefreshTokenRepository;
