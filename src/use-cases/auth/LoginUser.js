const bcrypt = require('bcrypt');
const Jwt = require('@hapi/jwt');
const AuthenticationError = require('../../exceptions/AuthenticationError');

class LoginUser {
  constructor(userRepository, { jwtSecret, jwtExpiresInSeconds }) {
    this._userRepository = userRepository;
    this._jwtSecret = jwtSecret;
    this._jwtExpiresInSeconds = jwtExpiresInSeconds;
  }

  async execute({ email, password }) {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Email atau password salah');
    }

    const accessToken = Jwt.token.generate(
      { aud: 'urn:portfolio-api', iss: 'portfolio-api', sub: String(user.id), email: user.email },
      { key: this._jwtSecret, algorithm: 'HS256' },
      { ttlSec: this._jwtExpiresInSeconds }
    );

    return { accessToken, expiresIn: this._jwtExpiresInSeconds };
  }
}

module.exports = LoginUser;