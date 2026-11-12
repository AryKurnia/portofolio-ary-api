const HOMEPAGE_PROJECT_LIMIT = 6;

// Agregat untuk SSR halaman utama: satu request berisi semua section (API.md §5).
class GetPortfolio {
  constructor({
    getProfile,
    listPublishedSkills,
    listPublishedProjects,
    getTimeline,
    listPublicSocialLinks,
    listPublishedCertificates,
  }) {
    this._getProfile = getProfile;
    this._listPublishedSkills = listPublishedSkills;
    this._listPublishedProjects = listPublishedProjects;
    this._getTimeline = getTimeline;
    this._listPublicSocialLinks = listPublicSocialLinks;
    this._listPublishedCertificates = listPublishedCertificates;
  }

  async execute() {
    // Sertifikat tanpa batas jumlah (tidak ada "See all" di desain).
    const [profile, skills, projects, timeline, socialLinks, certificates] = await Promise.all([
      this._getProfile.execute(),
      this._listPublishedSkills.execute(),
      this._listPublishedProjects.execute({ page: 1, limit: HOMEPAGE_PROJECT_LIMIT }),
      this._getTimeline.execute(),
      this._listPublicSocialLinks.execute(),
      this._listPublishedCertificates.execute(),
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
      certificates,
    };
  }
}

GetPortfolio.HOMEPAGE_PROJECT_LIMIT = HOMEPAGE_PROJECT_LIMIT;

module.exports = GetPortfolio;
