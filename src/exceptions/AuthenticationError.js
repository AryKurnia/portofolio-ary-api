const ClientError = require('./ClientError');

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 401, code: 'INVALID_CREDENTIALS' });
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
