const container = require('../../../infrastructure/container');

module.exports = {
  async login(request, h) {
    const result = await container.loginUser.execute(request.payload);
    return h.response(result).code(200);
  },
};