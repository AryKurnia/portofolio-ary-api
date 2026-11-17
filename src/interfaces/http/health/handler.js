const container = require('../../../infrastructure/container');

module.exports = {
  async check(request, h) {
    const result = await container.checkHealth.execute();
    const statusCode = result.status === 'ok' ? 200 : 503;
    return h.response({ data: result }).code(statusCode);
  },
};
