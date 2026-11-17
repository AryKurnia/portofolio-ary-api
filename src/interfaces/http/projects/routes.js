const handler = require('./handler');
const { idParamSchema, reorderPayloadSchema } = require('../shared/validation');
const {
  listProjectsQuerySchema,
  createProjectPayloadSchema,
  updateProjectPayloadSchema,
} = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  {
    method: 'GET',
    path: '/admin/projects',
    options: admin({ query: listProjectsQuerySchema }),
    handler: handler.list,
  },
  {
    method: 'POST',
    path: '/admin/projects',
    options: admin({ payload: createProjectPayloadSchema }),
    handler: handler.create,
  },
  {
    method: 'PATCH',
    path: '/admin/projects/reorder',
    options: admin({ payload: reorderPayloadSchema }),
    handler: handler.reorder,
  },
  {
    method: 'GET',
    path: '/admin/projects/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.detail,
  },
  {
    method: 'PATCH',
    path: '/admin/projects/{id}',
    options: admin({ params: idParamSchema, payload: updateProjectPayloadSchema }),
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/admin/projects/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.remove,
  },
];
