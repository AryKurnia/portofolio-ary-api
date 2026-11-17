const Organization = require('../../entities/Organization');
const Position = require('../../entities/Position');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

class CreatePosition {
  constructor(organizationRepository, positionRepository, { now = () => new Date() } = {}) {
    this._organizationRepository = organizationRepository;
    this._positionRepository = positionRepository;
    this._now = now;
  }

  /**
   * Panel "Timeline item" mengirim organization_id, ATAU organization_name + group
   * (organisasi dibuat bila belum ada). Aturan posisi divalidasi SEBELUM organisasi baru
   * dibuat, agar input yang salah tidak meninggalkan organisasi kosong.
   */
  async execute({ organizationId, organizationName, group, ...positionAttrs }) {
    let organization;
    if (organizationId) {
      organization = await this._organizationRepository.findById(organizationId);
      if (!organization) {
        throw new NotFoundError(`Organization with id ${organizationId} was not found.`);
      }
    } else {
      organization = await this._organizationRepository.findByNameAndGroup(organizationName, group);
    }

    const position = new Position({ ...positionAttrs, organizationId: organization?.id });
    const errors = position.validate({ group: organization?.group ?? group, now: this._now() });
    if (errors.length) {
      throw new ValidationError('Some fields are invalid.', errors);
    }

    if (!organization) {
      organization = await this._organizationRepository.create(
        new Organization({ name: organizationName, group })
      );
      position.organizationId = organization.id;
    }

    return this._positionRepository.create(position);
  }
}

module.exports = CreatePosition;
