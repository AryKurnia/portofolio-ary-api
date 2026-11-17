const routes = require('./routes');

module.exports = {
  name: 'certificates-plugin',
  register(server) {
    server.route(routes);
  },
};
