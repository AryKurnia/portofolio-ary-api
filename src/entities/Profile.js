const Entity = require('./Entity');

class Profile extends Entity {
  constructor({ name, email, tagline, about, ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.email = email;
    this.tagline = tagline;
    this.about = about;
  }
}

module.exports = Profile;
