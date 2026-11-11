const AuthenticationError = require('../../exceptions/AuthenticationError');

const INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password.';

class LoginUser {
  constructor(userRepository, refreshTokenRepository, passwordHasher, tokenManager) {
    this._userRepository = userRepository;
    this._refreshTokenRepository = refreshTokenRepository;
    this._passwordHasher = passwordHasher;
    this._tokenManager = tokenManager;
  }

  async execute({ username, password }) {
    const user = await this._userRepository.findByUsername(username);

    // compare tetap dipanggil walau user tidak ada (hash null) agar durasinya sama.
    const isPasswordValid = await this._passwordHasher.compare(password, user?.password ?? null);
    if (!user || !isPasswordValid) {
      throw new AuthenticationError(INVALID_CREDENTIALS_MESSAGE);
    }

    // Hash lama dengan cost lebih rendah ditingkatkan saat password asli tersedia.
    if (this._passwordHasher.needsRehash(user.password)) {
      const newHash = await this._passwordHasher.hash(password);
      await this._userRepository.updatePasswordHash(user.id, newHash);
    }

    const accessToken = this._tokenManager.createAccessToken(user);
    const refreshToken = this._tokenManager.createRefreshToken();
    await this._refreshTokenRepository.save({
      userId: user.id,
      tokenHash: refreshToken.tokenHash,
      expiresAt: refreshToken.expiresAt,
    });

    return {
      accessToken: accessToken.token,
      expiresIn: accessToken.expiresIn,
      refreshToken: refreshToken.token,
      refreshTokenExpiresAt: refreshToken.expiresAt,
      admin: { id: user.id, username: user.username },
    };
  }
}

module.exports = LoginUser;
