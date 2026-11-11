const ClientError = require('./ClientError');

class NotFoundError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
