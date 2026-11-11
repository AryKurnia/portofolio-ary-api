const UnauthorizedError = require('../../exceptions/UnauthorizedError');

class RefreshAccessToken {
  constructor(
    refreshTokenRepository,
    userRepository,
    tokenManager,
    { now = () => new Date() } = {}
  ) {
    this._refreshTokenRepository = refreshTokenRepository;
    this._userRepository = userRepository;
    this._tokenManager = tokenManager;
    this._now = now;
  }

  async execute(refreshToken) {
    if (!refreshToken) {
      throw new UnauthorizedError('Missing refresh token.');
    }

    const tokenHash = this._tokenManager.hashRefreshToken(refreshToken);
    const storedToken = await this._refreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken) {
      throw new UnauthorizedError('Invalid refresh token.');
    }

    // Token yang sudah dirotasi dipakai lagi = kemungkinan dicuri → cabut semua sesi user.
    if (storedToken.revokedAt) {
      await this._refreshTokenRepository.revokeAllForUser(storedToken.userId);
      throw new UnauthorizedError('Refresh token has been revoked.');
    }

    if (new Date(storedToken.expiresAt) <= this._now()) {
      throw new UnauthorizedError('Refresh token has expired.');
    }

    const user = await this._userRepository.findById(storedToken.userId);
    if (!user) {
      throw new UnauthorizedError('Account no longer exists.');
    }

    const nextRefreshToken = this._tokenManager.createRefreshToken();
    const rotated = await this._refreshTokenRepository.rotate({
      oldTokenId: storedToken.id,
      userId: user.id,
      tokenHash: nextRefreshToken.tokenHash,
      expiresAt: nextRefreshToken.expiresAt,
    });
    if (!rotated) {
      throw new UnauthorizedError('Refresh token has been revoked.');
    }

    const accessToken = this._tokenManager.createAccessToken(user);
    return {
      accessToken: accessToken.token,
      expiresIn: accessToken.expiresIn,
      refreshToken: nextRefreshToken.token,
      refreshTokenExpiresAt: nextRefreshToken.expiresAt,
    };
  }
}

module.exports = RefreshAccessToken;
