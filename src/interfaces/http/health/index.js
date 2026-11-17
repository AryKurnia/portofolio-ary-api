const routes = require('./routes');

module.exports = {
  name: 'health-plugin',
  register(server) {
    server.route(routes);
  },
};
