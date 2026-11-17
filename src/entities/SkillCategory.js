const Entity = require('./Entity');

class SkillCategory extends Entity {
  constructor({ name, sortOrder = 0, ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.sortOrder = sortOrder;
  }
}

module.exports = SkillCategory;
