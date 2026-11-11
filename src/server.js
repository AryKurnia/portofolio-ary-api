// Dependencies
const Jwt = require('@hapi/jwt');
const Hapi = require('@hapi/hapi');
const HapiPino = require('hapi-pino');

const config = require('./config');
const logger = require('./infrastructure/logger');

// Exceptions
const ClientError = require('./exceptions/ClientError');
const ValidationError = require('./exceptions/ValidationError');

const API_PREFIX = '/api/v1';

// Kode error mesin-baca untuk error bawaan Hapi/Boom (lihat docs/design/API.md §4).
const BOOM_ERRORS = {
  400: { code: 'BAD_REQUEST' },
  401: { code: 'UNAUTHORIZED', message: 'Missing or invalid access token.' },
  403: { code: 'FORBIDDEN', message: 'You do not have access to this resource.' },
  404: { code: 'NOT_FOUND', message: 'Resource not found.' },
  409: { code: 'CONFLICT' },
  413: { code: 'PAYLOAD_TOO_LARGE', message: 'File must be 2 MB or smaller.' },
  415: { code: 'UNSUPPORTED_MEDIA_TYPE' },
  429: { code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.' },
};

const errorResponse = (h, statusCode, { code, message, details }) =>
  h
    .response({ error: { code, message, ...(details?.length ? { details } : {}) } })
    .code(statusCode);

// Mengubah error Joi menjadi ValidationError dengan pesan per field untuk panel form UI.
const validationFailAction = (request, h, err) => {
  const details = (err.details ?? []).map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));
  throw new ValidationError('Some fields are invalid.', details);
};

// Merakit server tanpa start() — dipakai src/index.js dan tes (server.inject).
const createServer = async () => {
  const { corsOrigins } = config.server;

  const server = Hapi.server({
    port: config.server.port,
    host: config.server.host,
    routes: {
      cors: corsOrigins.length ? { origin: corsOrigins, credentials: true } : false,
      security: {
        hsts: true,
        xframe: 'deny',
        noSniff: true,
        referrer: 'strict-origin-when-cross-origin',
      },
      validate: {
        failAction: validationFailAction,
        options: { abortEarly: false, errors: { wrap: { label: false } } },
      },
    },
  });

  await server.register({ plugin: HapiPino, options: { instance: logger } });
  await server.register(Jwt);

  server.auth.strategy('jwt', 'jwt', {
    keys: config.jwt.secret,
    verify: {
      aud: config.jwt.audience,
      iss: config.jwt.issuer,
      sub: false,
      exp: true,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        userId: Number(artifacts.decoded.payload.sub),
        username: artifacts.decoded.payload.username,
      },
    }),
  });

  await server.register(
    [
      require('./interfaces/http/health/index'),
      require('./interfaces/http/auth/index'),
      require('./interfaces/http/skills/index'),
      require('./interfaces/http/social-media/index'),
      require('./interfaces/http/profile/index'),
      require('./interfaces/http/timeline/index'),
      require('./interfaces/http/skill-categories/index'),
      require('./interfaces/http/projects/index'),
    ],
    { routes: { prefix: API_PREFIX } }
  );

  // Error Handling: semua error dibalas dengan format { error: { code, message, details? } }
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

    if (!response.isBoom) {
      // Data admin tidak boleh disimpan cache mana pun (API.md §9).
      if (request.path.startsWith(`${API_PREFIX}/admin/`)) {
        response.header('Cache-Control', 'no-store');
      }
      return h.continue;
    }

    if (response instanceof ClientError) {
      return errorResponse(h, response.statusCode, response);
    }

    const { statusCode } = response.output;
    if (statusCode < 500) {
      const known = BOOM_ERRORS[statusCode] ?? { code: 'BAD_REQUEST' };
      return errorResponse(h, statusCode, {
        code: known.code,
        message: known.message ?? response.output.payload.message,
      });
    }

    request.log(['error'], response);
    return errorResponse(h, 500, {
      code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side.',
    });
  });

  return server;
};

module.exports = { createServer, API_PREFIX };
