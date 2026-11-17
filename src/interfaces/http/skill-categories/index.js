const routes = require('./routes');

module.exports = {
  name: 'skill-categories-plugin',
  register(server) {
    server.route(routes);
  },
};
