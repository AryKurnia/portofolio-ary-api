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

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();