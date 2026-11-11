const handler = require('./handler');

module.exports = [
  {
    method: 'GET',
    path: '/health',
    handler: handler.check,
  },
];
