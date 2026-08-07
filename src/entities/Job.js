const Entity = require('./Entity');

class Job extends Entity {
  constructor({ company, position, startDate, endDate, description, ...attrs } = {}) {
    super(attrs);
    this.company = company;
    this.position = position;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
  }
}

module.exports = Job;
