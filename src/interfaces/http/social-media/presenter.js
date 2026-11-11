// Bentuk JSON publik untuk SocialMedia (snake_case, field eksplisit).
const toSocialMediaResponse = (socialMedia) => ({
  id: socialMedia.id,
  platform: socialMedia.platform,
  url: socialMedia.url,
  username: socialMedia.username,
  enabled: socialMedia.enabled,
});

module.exports = { toSocialMediaResponse };
