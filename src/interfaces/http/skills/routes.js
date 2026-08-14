// src/interfaces/http/skills/routes.js
const handler = require('./handler');
const {
  idParamSchema,
  listQuerySchema,
  createSkillPayloadSchema,
  updateSkillPayloadSchema,
} = require('./validator');

module.exports = [
  {
    method: 'GET',
    path: '/skills',
    options: { validate: { query: listQuerySchema } },
    handler: handler.list,
  },
  {
    method: 'GET',
    path: '/skills/{id}',
    options: { validate: { params: idParamSchema } },
    handler: handler.detail,
  },
  {
    method: 'POST',
    path: '/skills',
    options: {
      auth: 'jwt',
      validate: { payload: createSkillPayloadSchema },
    },
    handler: handler.create,
  },
  {
    method: 'PUT',
    path: '/skills/{id}',
    options: {
      auth: 'jwt',
      validate: { params: idParamSchema, payload: updateSkillPayloadSchema },
    },
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/skills/{id}',
    options: {
      auth: 'jwt',
      validate: { params: idParamSchema },
    },
    handler: handler.remove,
  },
  {
    method: 'POST',
    path: '/skills/{id}/logo',
    options: {
      auth: 'jwt',
      payload: {
        output: 'stream',
        parse: true,
        multipart: true,
        maxBytes: 2 * 1024 * 1024, // 2MB
        allow: 'multipart/form-data',
      },
      validate: { params: idParamSchema },
    },
    handler: handler.uploadLogo,
  },
];