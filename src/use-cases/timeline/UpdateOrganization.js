const Organization = require('../../entities/Organization');
const NotFoundError = require('../../exceptions/NotFoundError');
const ConflictError = require('../../exceptions/ConflictError');
const pickDefined = require('../pickDefined');

// Grup tidak bisa diubah: posisi di dalamnya terikat aturan tipe per grup.
class UpdateOrganization {
  constructor(organizationRepository) {
    this._organizationRepository = organizationRepository;
  }

  async execute(id, { name, location }) {
    const existing = await this._organizationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Organization with id ${id} was not found.`);
    }

    if (name !== undefined && name !== existing.name) {
      const duplicate = await this._organizationRepository.findByNameAndGroup(name, existing.group);
      if (duplicate) {
        throw new ConflictError('An organization with this name already exists in this group.', [
          { field: 'name', message: 'Name is already used in this group.' },
        ]);
      }
    }

    const updated = new Organization({ ...existing, ...pickDefined({ name, location }) });
    return this._organizationRepository.update(id, updated);
  }
}

module.exports = UpdateOrganization;
