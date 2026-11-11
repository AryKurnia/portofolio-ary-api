const handler = require('./handler');
const { idParamSchema, reorderPayloadSchema } = require('../shared/validation');
const {
  listOrganizationsQuerySchema,
  createOrganizationPayloadSchema,
  updateOrganizationPayloadSchema,
  createPositionPayloadSchema,
  updatePositionPayloadSchema,
} = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  {
    method: 'GET',
    path: '/admin/organizations',
    options: admin({ query: listOrganizationsQuerySchema }),
    handler: handler.listOrganizations,
  },
  {
    method: 'POST',
    path: '/admin/organizations',
    options: admin({ payload: createOrganizationPayloadSchema }),
    handler: handler.createOrganization,
  },
  {
    method: 'PATCH',
    path: '/admin/organizations/{id}',
    options: admin({ params: idParamSchema, payload: updateOrganizationPayloadSchema }),
    handler: handler.updateOrganization,
  },
  {
    method: 'DELETE',
    path: '/admin/organizations/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.deleteOrganization,
  },
  {
    method: 'PATCH',
    path: '/admin/organizations/{id}/positions/reorder',
    options: admin({ params: idParamSchema, payload: reorderPayloadSchema }),
    handler: handler.reorderPositions,
  },
  {
    method: 'POST',
    path: '/admin/positions',
    options: admin({ payload: createPositionPayloadSchema }),
    handler: handler.createPosition,
  },
  {
    method: 'PATCH',
    path: '/admin/positions/{id}',
    options: admin({ params: idParamSchema, payload: updatePositionPayloadSchema }),
    handler: handler.updatePosition,
  },
  {
    method: 'DELETE',
    path: '/admin/positions/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.deletePosition,
  },
];
