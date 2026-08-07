const Entity = require('./Entity');

class SocialMedia extends Entity {
  constructor({ platform, url, username, enabled = true, ...attrs } = {}) {
    super(attrs);
    this.platform = platform;
    this.url = url;
    this.username = username;
    this.enabled = enabled;
  }
}

module.exports = SocialMedia;
