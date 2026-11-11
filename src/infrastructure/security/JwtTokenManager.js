const crypto = require('node:crypto');
const Jwt = require('@hapi/jwt');
const TokenManager = require('../../security/TokenManager');

const REFRESH_TOKEN_BYTES = 32;

class JwtTokenManager extends TokenManager {
  constructor({
    secret,
    audience,
    issuer,
    accessTokenTtlSeconds,
    refreshTokenTtlSeconds,
    now = () => new Date(),
  }) {
    super();
    this._secret = secret;
    this._audience = audience;
    this._issuer = issuer;
    this._accessTokenTtlSeconds = accessTokenTtlSeconds;
    this._refreshTokenTtlSeconds = refreshTokenTtlSeconds;
    this._now = now;
  }

  createAccessToken({ id, username }) {
    const token = Jwt.token.generate(
      { aud: this._audience, iss: this._issuer, sub: String(id), username },
      { key: this._secret, algorithm: 'HS256' },
      { ttlSec: this._accessTokenTtlSeconds }
    );
    return { token, expiresIn: this._accessTokenTtlSeconds };
  }

  createRefreshToken() {
    const token = crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('base64url');
    const expiresAt = new Date(this._now().getTime() + this._refreshTokenTtlSeconds * 1000);
    return { token, tokenHash: this.hashRefreshToken(token), expiresAt };
  }

  hashRefreshToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}

module.exports = JwtTokenManager;
