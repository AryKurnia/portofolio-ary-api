// Satu-satunya tempat membaca process.env di dalam src/.
// Env divalidasi saat modul dimuat, sehingga konfigurasi yang salah gagal cepat saat start.
require('dotenv').config({ quiet: true });
const Joi = require('joi');

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),

  SERVER_HOST: Joi.string().default('localhost'),
  SERVER_PORT: Joi.number().port().default(3000),
  // Daftar origin dipisah koma, mis. "https://arykurnia.com,https://admin.arykurnia.com".
  // Kosong = CORS tidak diaktifkan (aman untuk SSR / same-origin).
  CORS_ORIGINS: Joi.string().allow('').default(''),
  LOG_LEVEL: Joi.string()
    .valid('fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent')
    .default(Joi.ref('$defaultLogLevel')),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().allow('').default(''),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_TEST_NAME: Joi.string().when('NODE_ENV', { is: 'test', then: Joi.required() }),

  MINIO_ENDPOINT: Joi.string().required(),
  MINIO_PORT: Joi.number().port().required(),
  MINIO_USE_SSL: Joi.boolean().default(false),
  MINIO_ACCESS_KEY: Joi.string().required(),
  MINIO_SECRET_KEY: Joi.string().required(),
  MINIO_BUCKET: Joi.string().required(),
  MINIO_PUBLIC_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),

  JWT_SECRET: Joi.string()
    .required()
    .when('NODE_ENV', { is: 'production', then: Joi.string().min(32) }),
  JWT_EXPIRES_IN_SECONDS: Joi.number().integer().positive().required(),
}).unknown(true);

const { value: env, error } = schema.validate(process.env, {
  abortEarly: false,
  context: { defaultLogLevel: process.env.NODE_ENV === 'test' ? 'silent' : 'info' },
});
if (error) {
  throw new Error(`Konfigurasi env tidak valid: ${error.message}`);
}

module.exports = {
  env: env.NODE_ENV,
  server: {
    host: env.SERVER_HOST,
    port: env.SERVER_PORT,
    corsOrigins: env.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  log: {
    level: env.LOG_LEVEL,
  },
  minio: {
    endPoint: env.MINIO_ENDPOINT,
    port: env.MINIO_PORT,
    useSSL: env.MINIO_USE_SSL,
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
    bucket: env.MINIO_BUCKET,
    publicUrl: env.MINIO_PUBLIC_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresInSeconds: env.JWT_EXPIRES_IN_SECONDS,
    audience: 'urn:portfolio-api',
    issuer: 'portfolio-api',
  },
};
