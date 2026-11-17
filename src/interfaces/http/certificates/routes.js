const handler = require('./handler');
const { idParamSchema, reorderPayloadSchema } = require('../shared/validation');
const { createCertificatePayloadSchema, updateCertificatePayloadSchema } = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  { method: 'GET', path: '/admin/certificates', options: admin(), handler: handler.list },
  {
    method: 'POST',
    path: '/admin/certificates',
    options: admin({ payload: createCertificatePayloadSchema }),
    handler: handler.create,
  },
  {
    method: 'PATCH',
    path: '/admin/certificates/reorder',
    options: admin({ payload: reorderPayloadSchema }),
    handler: handler.reorder,
  },
  {
    method: 'PATCH',
    path: '/admin/certificates/{id}',
    options: admin({ params: idParamSchema, payload: updateCertificatePayloadSchema }),
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/admin/certificates/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.remove,
  },
];
