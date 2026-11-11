const routes = require('./routes');

module.exports = {
  name: 'timeline-plugin',
  register(server) {
    server.route(routes);
  },
};
