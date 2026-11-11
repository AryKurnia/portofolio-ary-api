// Dijalankan Jest sebelum setiap file tes (lihat "jest.setupFiles" di package.json).
// Env palsu ini dipasang lebih dulu, sehingga dotenv tidak menimpanya dengan nilai dari .env asli.
Object.assign(process.env, {
  NODE_ENV: 'test',
  DATABASE_HOST: 'localhost',
  DATABASE_USER: 'test',
  DATABASE_PASSWORD: '',
  DATABASE_NAME: 'test',
  DATABASE_TEST_NAME: 'test',
  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: '9000',
  MINIO_USE_SSL: 'false',
  MINIO_ACCESS_KEY: 'test',
  MINIO_SECRET_KEY: 'test',
  MINIO_BUCKET: 'test',
  MINIO_PUBLIC_URL: 'http://localhost:9000',
  JWT_SECRET: 'secret-khusus-tes-yang-panjangnya-32+',
  JWT_EXPIRES_IN_SECONDS: '3600',
  CORS_ORIGINS: '',
  LOG_LEVEL: 'silent',
});
