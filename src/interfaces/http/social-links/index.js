const routes = require('./routes');

module.exports = {
  name: 'social-links-plugin',
  register(server) {
    server.route(routes);
  },
};
