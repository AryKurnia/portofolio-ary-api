// Base class untuk semua error yang aman ditampilkan ke klien.
// onPreResponse di src/server.js memetakannya ke { error: { code, message, details } }.
class ClientError extends Error {
  constructor(message, { statusCode = 400, code = 'BAD_REQUEST', details } = {}) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

module.exports = ClientError;
