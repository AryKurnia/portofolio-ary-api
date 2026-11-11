const handler = require('./handler');
const { idParamSchema, reorderPayloadSchema } = require('../shared/validation');
const { createSocialLinkPayloadSchema, updateSocialLinkPayloadSchema } = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  { method: 'GET', path: '/admin/social-links', options: admin(), handler: handler.list },
  {
    method: 'POST',
    path: '/admin/social-links',
    options: admin({ payload: createSocialLinkPayloadSchema }),
    handler: handler.create,
  },
  {
    method: 'PATCH',
    path: '/admin/social-links/reorder',
    options: admin({ payload: reorderPayloadSchema }),
    handler: handler.reorder,
  },
  {
    method: 'PATCH',
    path: '/admin/social-links/{id}',
    options: admin({ params: idParamSchema, payload: updateSocialLinkPayloadSchema }),
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/admin/social-links/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.remove,
  },
];
