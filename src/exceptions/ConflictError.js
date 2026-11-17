const ClientError = require('./ClientError');

// Bentrok dengan data yang sudah ada (nama duplikat, masih dipakai, dsb.).
class ConflictError extends ClientError {
  constructor(message, details = []) {
    super(message, { statusCode: 409, code: 'CONFLICT', details });
    this.name = 'ConflictError';
  }
}

module.exports = ConflictError;
