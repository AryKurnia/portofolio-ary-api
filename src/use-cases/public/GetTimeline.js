const Organization = require('../../entities/Organization');

class GetTimeline {
  constructor(organizationRepository) {
    this._organizationRepository = organizationRepository;
  }

  // → { education: Organization[], work_organization: Organization[] }, sudah terurut.
  // Organisasi tanpa posisi tidak ditampilkan di portofolio.
  async execute() {
    const organizations = await this._organizationRepository.findAll();
    const sorted = Organization.sortForTimeline(
      organizations.filter((organization) => organization.positions.length > 0)
    );

    return Object.fromEntries(
      Organization.GROUPS.map((group) => [group, sorted.filter((o) => o.group === group)])
    );
  }
}

module.exports = GetTimeline;
