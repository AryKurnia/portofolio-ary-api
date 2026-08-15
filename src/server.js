'use strict';

// Dependencies
const Jwt = require('@hapi/jwt');
const Hapi = require('@hapi/hapi');

// Exceptions
const NotFoundError = require('./exceptions/NotFoundError');
const AuthenticationError = require('./exceptions/AuthenticationError');

// Environment Variables
require('dotenv').config();

const init = async () => {

  const server = Hapi.server({
    port: process.env.SERVER_PORT || 3000,
    host: process.env.SERVER_HOST || 'localhost'
  });

  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET,
    verify: {
      aud: 'urn:portfolio-api',
      iss: 'portfolio-api',
      sub: false,
      exp: true,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: { userId: artifacts.decoded.payload.sub, email: artifacts.decoded.payload.email },
    })
  });

  await server.register(require('./interfaces/http/auth/index'));
  await server.register(require('./interfaces/http/skills/index'));
  await server.register(require('./interfaces/http/social-media/index'));

  // Error Handling
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (!response.isBoom) {
      return h.continue;
    }

    if (response instanceof NotFoundError) {
      return h.response({ statusCode: 404, error: 'Not Found', message: response.message }).code(404);
    }

    if (response instanceof AuthenticationError) {
      return h.response({ statusCode: 401, error: 'Unauthorized', message: response.message }).code(401);
    }

    if (response.output.statusCode < 500) {
      return h.continue; // error bawaan Hapi (400 validasi, 401 auth plugin, dst)
    }

    console.error('[UNHANDLED ERROR]', response);
    return h.response({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();