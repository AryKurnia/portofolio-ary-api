const handler = require('./handler');
const { platformParamSchema, updateSocialMediaPayloadSchema } = require('./validator');

module.exports = [
  {
    method: 'GET',
    path: '/profile/social-media',
    handler: handler.list,
  },
  {
    method: 'GET',
    path: '/profile/social-media/{platform}',
    options: {
      validate: {
        params: platformParamSchema,
      },
    },
    handler: handler.detail,
  },
  {
    method: 'PUT',
    path: '/profile/social-media/{platform}',
    options: {
      auth: 'jwt',
      validate: {
        params: platformParamSchema,
        payload: updateSocialMediaPayloadSchema,
      },
    },
    handler: handler.update,
  },
];