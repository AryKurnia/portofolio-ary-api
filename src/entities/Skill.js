const Entity = require('./Entity');

class Skill extends Entity {
  constructor({ name, logoUrl, description, enabled = true, ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.logoUrl = logoUrl;
    this.description = description;
    this.enabled = enabled;
  }
}

module.exports = Skill;