// src/interfaces/http/skills/index.js
const routes = require('./routes');

module.exports = {
  name: 'skills-plugin',
  register(server) {
    server.route(routes);
  },
};