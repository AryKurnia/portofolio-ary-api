const handler = require('./handler');
const { updateProfilePayloadSchema } = require('./validator');

module.exports = [
  {
    method: 'GET',
    path: '/admin/profile',
    options: { auth: 'jwt' },
    handler: handler.adminGet,
  },
  {
    method: 'PATCH',
    path: '/admin/profile',
    options: { auth: 'jwt', validate: { payload: updateProfilePayloadSchema } },
    handler: handler.adminUpdate,
  },
];
