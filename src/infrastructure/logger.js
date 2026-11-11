const pino = require('pino');
const config = require('../config');

// Satu instance logger untuk Hapi (via hapi-pino) dan use-case yang butuh mencatat kegagalan non-fatal.
const logger = pino({
  level: config.log.level,
  redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
});

module.exports = logger;
