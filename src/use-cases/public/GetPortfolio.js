const HOMEPAGE_PROJECT_LIMIT = 6;

// Agregat untuk SSR halaman utama: satu request berisi semua section (API.md §5).
class GetPortfolio {
  constructor({
    getProfile,
    listPublishedSkills,
    listPublishedProjects,
    getTimeline,
    listPublicSocialLinks,
  }) {
    this._getProfile = getProfile;
    this._listPublishedSkills = listPublishedSkills;
    this._listPublishedProjects = listPublishedProjects;
    this._getTimeline = getTimeline;
    this._listPublicSocialLinks = listPublicSocialLinks;
  }

  async execute() {
    const [profile, skills, projects, timeline, socialLinks] = await Promise.all([
      this._getProfile.execute(),
      this._listPublishedSkills.execute(),
      this._listPublishedProjects.execute({ page: 1, limit: HOMEPAGE_PROJECT_LIMIT }),
      this._getTimeline.execute(),
      this._listPublicSocialLinks.execute(),
    ]);

    return {
      profile,
      skills,
      projects: {
        items: projects.data,
        total: projects.meta.total,
        hasMore: projects.meta.total > projects.data.length,
      },
      timeline,
      socialLinks,
    };
  }
}

GetPortfolio.HOMEPAGE_PROJECT_LIMIT = HOMEPAGE_PROJECT_LIMIT;

module.exports = GetPortfolio;
