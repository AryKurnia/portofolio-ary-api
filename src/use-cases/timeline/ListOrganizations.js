const Organization = require('../../entities/Organization');

class ListOrganizations {
  constructor(organizationRepository) {
    this._organizationRepository = organizationRepository;
  }

  async execute({ group } = {}) {
    const organizations = await this._organizationRepository.findAll({ group });
    return Organization.sortForTimeline(organizations);
  }
}

module.exports = ListOrganizations;
