class LogoutUser {
  constructor(refreshTokenRepository, tokenManager) {
    this._refreshTokenRepository = refreshTokenRepository;
    this._tokenManager = tokenManager;
  }

  // Idempoten: logout tanpa cookie atau dengan token yang tidak dikenal tetap dianggap berhasil.
  async execute(refreshToken) {
    if (!refreshToken) return;

    const tokenHash = this._tokenManager.hashRefreshToken(refreshToken);
    const storedToken = await this._refreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken || storedToken.revokedAt) return;

    await this._refreshTokenRepository.revoke(storedToken.id);
  }
}

module.exports = LogoutUser;
