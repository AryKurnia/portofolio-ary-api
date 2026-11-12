const ClientError = require('./ClientError');

class PayloadTooLargeError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 413, code: 'PAYLOAD_TOO_LARGE' });
    this.name = 'PayloadTooLargeError';
  }
}

module.exports = PayloadTooLargeError;
