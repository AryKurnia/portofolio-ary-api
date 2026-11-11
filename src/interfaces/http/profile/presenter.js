// Foto profil (photo) ditambahkan bersama fitur upload di M4.
const toProfileResponse = (profile) => ({
  greeting: profile.greeting,
  tagline: profile.tagline,
  about: profile.about,
  project_intro: profile.projectIntro || null,
  email: profile.email,
  updated_at: profile.updatedAt,
});

module.exports = { toProfileResponse };
