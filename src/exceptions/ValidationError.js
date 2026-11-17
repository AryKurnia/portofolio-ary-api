const ClientError = require('./ClientError');

// details: [{ field, message }] — ditampilkan UI per field di panel form.
class ValidationError extends ClientError {
  constructor(message, details = []) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', details });
    this.name = 'ValidationError';
  }
}

module.exports = ValidationError;
