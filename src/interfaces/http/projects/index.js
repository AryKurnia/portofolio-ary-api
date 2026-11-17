const routes = require('./routes');

module.exports = {
  name: 'projects-plugin',
  register(server) {
    server.route(routes);
  },
};
