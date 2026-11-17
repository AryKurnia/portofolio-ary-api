const Entity = require('./Entity');

const PLATFORMS = ['github', 'facebook', 'instagram', 'linkedin', 'discord', 'x', 'other'];

class SocialLink extends Entity {
  constructor({ platform, label = null, url, isPublished = true, sortOrder = 0, ...attrs } = {}) {
    super(attrs);
    this.platform = platform;
    this.label = label;
    this.url = url;
    this.isPublished = isPublished;
    this.sortOrder = sortOrder;
  }
}

SocialLink.PLATFORMS = PLATFORMS;

module.exports = SocialLink;
