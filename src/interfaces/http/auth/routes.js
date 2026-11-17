const handler = require('./handler');
const { loginPayloadSchema } = require('./validator');

module.exports = [
  {
    method: 'POST',
    path: '/admin/auth/login',
    options: { auth: false, validate: { payload: loginPayloadSchema } },
    handler: handler.login,
  },
  {
    // Diautentikasi lewat cookie refresh_token, bukan Bearer (access token boleh sudah kedaluwarsa).
    method: 'POST',
    path: '/admin/auth/refresh',
    options: { auth: false },
    handler: handler.refresh,
  },
  {
    method: 'POST',
    path: '/admin/auth/logout',
    options: { auth: false },
    handler: handler.logout,
  },
  {
    method: 'GET',
    path: '/admin/auth/me',
    options: { auth: 'jwt' },
    handler: handler.me,
  },
];
