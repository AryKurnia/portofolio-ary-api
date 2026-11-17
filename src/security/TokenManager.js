class TokenManager {
  // → { token, expiresIn }
  createAccessToken({ id, username }) {
    throw new Error(`${this.constructor.name}.createAccessToken belum diimplementasikan`);
  }

  // → { token, tokenHash, expiresAt }
  createRefreshToken() {
    throw new Error(`${this.constructor.name}.createRefreshToken belum diimplementasikan`);
  }

  hashRefreshToken(token) {
    throw new Error(`${this.constructor.name}.hashRefreshToken belum diimplementasikan`);
  }
}

module.exports = TokenManager;
