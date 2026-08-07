const Entity = require('./Entity');

class Project extends Entity {
  constructor({ name, description, thumbnailUrl, url, enabled = true, ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.description = description;
    this.thumbnailUrl = thumbnailUrl;
    this.url = url;
    this.enabled = enabled;
  }
}

module.exports = Project;