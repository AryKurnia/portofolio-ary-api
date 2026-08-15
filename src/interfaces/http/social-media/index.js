const routes = require('./routes');

module.exports = {
  name: 'social-media-plugin',
  register(server) {
    server.route(routes);
  },
};