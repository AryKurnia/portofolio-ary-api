const container = require('../../../infrastructure/container');
const AuthenticationError = require('../../../exceptions/AuthenticationError');

module.exports = {
  async login(request, h) {
    try {
      const result = await container.loginUser.execute(request.payload);
      return h.response(result).code(200);
    } catch (err) {
      if (err instanceof AuthenticationError) {
        return h.response({ statusCode: 401, error: 'Unauthorized', message: err.message }).code(401);
      }
      throw err;
    }
  },
};