const Entity = require('./Entity');

class Profile extends Entity {
  constructor({ name, email, tagline, about, photoUrl, socialMedia, ...attrs } = {}) {
    super(attrs);
    this.name = name;
    this.email = email;
    this.tagline = tagline;
    this.about = about;
    this.photoUrl = photoUrl;
    this.socialMedia = socialMedia;
  }
}

module.exports = Profile;
