const handler = require('./handler');
const { loginPayloadSchema } = require('./validator');

module.exports = [
  {
    method: 'POST',
    path: '/auth/login',
    options: { auth: false, validate: { payload: loginPayloadSchema } },
    handler: handler.login,
  },
];