const container = require('../../../infrastructure/container');
const { REFRESH_TOKEN_COOKIE } = require('./cookie');
const { toAdminResponse, toTokenResponse, toLoginResponse } = require('./presenter');

module.exports = {
  async login(request, h) {
    const result = await container.loginUser.execute(request.payload);
    return h
      .response({ data: toLoginResponse(result) })
      .state(REFRESH_TOKEN_COOKIE, result.refreshToken)
      .code(200);
  },

  async refresh(request, h) {
    const result = await container.refreshAccessToken.execute(request.state[REFRESH_TOKEN_COOKIE]);
    return h
      .response({ data: toTokenResponse(result) })
      .state(REFRESH_TOKEN_COOKIE, result.refreshToken)
      .code(200);
  },

  async logout(request, h) {
    await container.logoutUser.execute(request.state[REFRESH_TOKEN_COOKIE]);
    return h.response().unstate(REFRESH_TOKEN_COOKIE).code(204);
  },

  async me(request, h) {
    const admin = await container.getCurrentAdmin.execute(request.auth.credentials.userId);
    return h.response({ data: toAdminResponse(admin) }).code(200);
  },
};
