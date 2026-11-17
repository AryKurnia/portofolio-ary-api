const routes = require('./routes');

module.exports = {
  name: 'public-plugin',
  register(server) {
    server.route(routes);
  },
};
