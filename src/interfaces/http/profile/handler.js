const container = require('../../../infrastructure/container');
const { toProfileResponse } = require('./presenter');

module.exports = {
  async adminGet(request, h) {
    const profile = await container.getProfile.execute();
    return h.response({ data: toProfileResponse(profile) }).code(200);
  },

  async adminUpdate(request, h) {
    const {
      greeting,
      tagline,
      about,
      project_intro: projectIntro,
      email,
      photo_id: photoMediaId,
    } = request.payload;
    const profile = await container.updateProfile.execute({
      greeting,
      tagline,
      about,
      projectIntro,
      email,
      photoMediaId,
    });
    return h.response({ data: toProfileResponse(profile) }).code(200);
  },
};
