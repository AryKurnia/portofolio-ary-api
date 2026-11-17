const { toImageResponse } = require('../shared/media');

const toProfileResponse = (profile) => ({
  greeting: profile.greeting,
  tagline: profile.tagline,
  about: profile.about,
  project_intro: profile.projectIntro || null,
  email: profile.email,
  photo: toImageResponse(profile.photo),
  updated_at: profile.updatedAt,
});

module.exports = { toProfileResponse };
