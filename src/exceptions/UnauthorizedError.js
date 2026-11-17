const ClientError = require('./ClientError');

// Sesi tidak valid (refresh token hilang/kedaluwarsa/dicabut, akun sudah tidak ada).
// Berbeda dari AuthenticationError (INVALID_CREDENTIALS) yang khusus untuk login gagal.
class UnauthorizedError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 401, code: 'UNAUTHORIZED' });
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
