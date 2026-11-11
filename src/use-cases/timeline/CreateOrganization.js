const Organization = require('../../entities/Organization');
const ConflictError = require('../../exceptions/ConflictError');

class CreateOrganization {
  constructor(organizationRepository) {
    this._organizationRepository = organizationRepository;
  }

  async execute({ name, group, location = null }) {
    const duplicate = await this._organizationRepository.findByNameAndGroup(name, group);
    if (duplicate) {
      throw new ConflictError('An organization with this name already exists in this group.', [
        { field: 'name', message: 'Name is already used in this group.' },
      ]);
    }

    return this._organizationRepository.create(new Organization({ name, group, location }));
  }
}

module.exports = CreateOrganization;
