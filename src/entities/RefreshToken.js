const Entity = require('./Entity');

// Yang disimpan hanya hash token; token asli hanya ada di cookie klien.
class RefreshToken extends Entity {
  constructor({
    userId,
    tokenHash,
    expiresAt,
    revokedAt = null,
    replacedById = null,
    ...attrs
  } = {}) {
    super(attrs);
    this.userId = userId;
    this.tokenHash = tokenHash;
    this.expiresAt = expiresAt;
    this.revokedAt = revokedAt;
    this.replacedById = replacedById;
  }
}

module.exports = RefreshToken;
