const handler = require('./handler');
const { idParamSchema } = require('../shared/validation');
const { listProjectsQuerySchema } = require('../projects/validator');

// Endpoint publik untuk halaman portofolio: tanpa auth, hanya data yang terbit.
module.exports = [
  { method: 'GET', path: '/portfolio', handler: handler.portfolio },
  { method: 'GET', path: '/profile', handler: handler.profile },
  {
    method: 'GET',
    path: '/projects',
    options: { validate: { query: listProjectsQuerySchema } },
    handler: handler.projects,
  },
  {
    method: 'GET',
    path: '/projects/{id}',
    options: { validate: { params: idParamSchema } },
    handler: handler.project,
  },
  { method: 'GET', path: '/skills', handler: handler.skills },
  { method: 'GET', path: '/timeline', handler: handler.timeline },
  { method: 'GET', path: '/social-links', handler: handler.socialLinks },
  { method: 'GET', path: '/certificates', handler: handler.certificates },
];
