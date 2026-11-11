const container = require('../../../infrastructure/container');
const { cachedResponse } = require('../shared/cache');
const presenter = require('./presenter');

module.exports = {
  async portfolio(request, h) {
    const portfolio = await container.getPortfolio.execute();
    return cachedResponse(h, { data: presenter.toPublicPortfolio(portfolio) });
  },

  async profile(request, h) {
    const profile = await container.getProfile.execute();
    return cachedResponse(h, { data: presenter.toPublicProfile(profile) });
  },

  async projects(request, h) {
    const { data, meta } = await container.listPublishedProjects.execute(request.query);
    return cachedResponse(h, { data: data.map(presenter.toPublicProject), meta });
  },

  async project(request, h) {
    const project = await container.getPublishedProject.execute(request.params.id);
    return cachedResponse(h, { data: presenter.toPublicProject(project) });
  },

  async skills(request, h) {
    const groups = await container.listPublishedSkills.execute();
    return cachedResponse(h, { data: presenter.toPublicSkillGroups(groups) });
  },

  async timeline(request, h) {
    const timeline = await container.getTimeline.execute();
    return cachedResponse(h, { data: presenter.toPublicTimeline(timeline) });
  },

  async socialLinks(request, h) {
    const links = await container.listPublicSocialLinks.execute();
    return cachedResponse(h, { data: links.map(presenter.toPublicSocialLink) });
  },
};
