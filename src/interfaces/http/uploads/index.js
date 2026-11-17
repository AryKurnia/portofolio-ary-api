const routes = require('./routes');

module.exports = {
  name: 'uploads-plugin',
  register(server) {
    server.route(routes);
  },
};
