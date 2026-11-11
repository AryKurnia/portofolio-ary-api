const ClientError = require('./ClientError');

class UnsupportedMediaTypeError extends ClientError {
  constructor(message) {
    super(message, { statusCode: 415, code: 'UNSUPPORTED_MEDIA_TYPE' });
    this.name = 'UnsupportedMediaTypeError';
  }
}

module.exports = UnsupportedMediaTypeError;
