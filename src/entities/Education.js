const Entity = require('./Entity');

class Education extends Entity {
  constructor({ institution, degree, fieldOfStudy, startDate, endDate, description, ...attrs } = {}) {
    super(attrs);
    this.institution = institution;
    this.degree = degree;
    this.fieldOfStudy = fieldOfStudy;
    this.startDate = startDate;
    this.endDate = endDate;
    this.description = description;
  }
}

module.exports = Education;