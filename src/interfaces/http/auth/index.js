const routes = require('./routes');

module.exports = {
  name: 'auth-plugin',
  register(server) {
    server.route(routes);
  },
};