const handler = require('./handler');
const {
  idParamSchema,
  listSkillsQuerySchema,
  createSkillPayloadSchema,
  updateSkillPayloadSchema,
  reorderSkillsPayloadSchema,
} = require('./validator');

const admin = (validate = {}) => ({ auth: 'jwt', validate });

module.exports = [
  {
    method: 'GET',
    path: '/admin/skills',
    options: admin({ query: listSkillsQuerySchema }),
    handler: handler.list,
  },
  {
    method: 'POST',
    path: '/admin/skills',
    options: admin({ payload: createSkillPayloadSchema }),
    handler: handler.create,
  },
  {
    method: 'PATCH',
    path: '/admin/skills/reorder',
    options: admin({ payload: reorderSkillsPayloadSchema }),
    handler: handler.reorder,
  },
  {
    method: 'GET',
    path: '/admin/skills/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.detail,
  },
  {
    method: 'PATCH',
    path: '/admin/skills/{id}',
    options: admin({ params: idParamSchema, payload: updateSkillPayloadSchema }),
    handler: handler.update,
  },
  {
    method: 'DELETE',
    path: '/admin/skills/{id}',
    options: admin({ params: idParamSchema }),
    handler: handler.remove,
  },
];
