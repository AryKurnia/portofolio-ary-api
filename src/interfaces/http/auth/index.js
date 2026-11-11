const routes = require('./routes');
const { REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions } = require('./cookie');

module.exports = {
  name: 'auth-plugin',
  register(server) {
    // Path cookie mengikuti prefix plugin (mis. /api/v1) agar hanya terkirim ke endpoint auth.
    const prefix = server.realm.modifiers.route.prefix ?? '';
    server.state(REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions(`${prefix}/admin/auth`));
    server.route(routes);
  },
};
