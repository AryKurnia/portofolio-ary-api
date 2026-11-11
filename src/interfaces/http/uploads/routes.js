const handler = require('./handler');
const { idParamSchema } = require('../shared/validation');
const { uploadQuerySchema, uploadPayloadSchema } = require('./validator');

const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

module.exports = [
  {
    method: 'POST',
    path: '/admin/uploads',
    options: {
      auth: 'jwt',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: MAX_UPLOAD_BYTES,
        allow: 'multipart/form-data',
      },
      validate: { query: uploadQuerySchema, payload: uploadPayloadSchema },
    },
    handler: handler.upload,
  },
  {
    method: 'DELETE',
    path: '/admin/uploads/{id}',
    options: { auth: 'jwt', validate: { params: idParamSchema } },
    handler: handler.remove,
  },
];
