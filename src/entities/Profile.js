const Entity = require('./Entity');

// Profil pemilik portofolio (singleton). Foto (photoMediaId) dikelola lewat upload di M4.
class Profile extends Entity {
  constructor({
    greeting,
    tagline,
    about,
    projectIntro = null,
    email,
    photoMediaId = null,
    ...attrs
  } = {}) {
    super(attrs);
    this.greeting = greeting;
    this.tagline = tagline;
    this.about = about;
    this.projectIntro = projectIntro;
    this.email = email;
    this.photoMediaId = photoMediaId;
  }
}

module.exports = Profile;
