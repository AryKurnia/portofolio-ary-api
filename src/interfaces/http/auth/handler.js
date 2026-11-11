const container = require('../../../infrastructure/container');
const { toLoginResponse } = require('./presenter');

module.exports = {
  async login(request, h) {
    const result = await container.loginUser.execute(request.payload);
    return h.response({ data: toLoginResponse(result) }).code(200);
  },
};
