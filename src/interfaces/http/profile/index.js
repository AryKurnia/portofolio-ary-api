const routes = require('./routes');

module.exports = {
  name: 'profile-plugin',
  register(server) {
    server.route(routes);
  },
};
