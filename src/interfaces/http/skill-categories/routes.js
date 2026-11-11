const handler = require('./handler');
const { idParamSchema, reorderPayloadSchema } = require('../shared/validation');
const { skillCategoryPayloadSchema } = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  { method: 'GET', path: '/admin/skill-categories', options: admin(), handler: handler.list },
  {
    method: 'POST',
    path: '/admin/skill-categories',
    options: admin({ payload: skillCategoryPayloadSchema }),
    handler: handler.create,
  },
  {
    method: 'PATCH',
    path: '/admin/skill-categories/reorder',
    options: admin({ payload: reorderPayloadSchema }),
    handler: handler.reorder,
  },
  {
    method: 'PATCH',
    path: '/admin/skill-categories/{id}',
    options: admin({ params: idParamSchema, payload: skillCategoryPayloadSchema }),
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/admin/skill-categories/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.remove,
  },
];
