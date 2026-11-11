const Position = require('../../entities/Position');
const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');
const pickDefined = require('../pickDefined');

class UpdatePosition {
  constructor(organizationRepository, positionRepository, { now = () => new Date() } = {}) {
    this._organizationRepository = organizationRepository;
    this._positionRepository = positionRepository;
    this._now = now;
  }

  // Aturan divalidasi terhadap gabungan data lama + perubahan (mis. hanya mengirim is_current=true
  // pada posisi yang punya end_date tetap ditolak). organization_id tidak bisa diubah.
  async execute(id, { title, type, eventName, startDate, endDate, isCurrent, description }) {
    const existing = await this._positionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Position with id ${id} was not found.`);
    }

    const updated = new Position({
      ...existing,
      ...pickDefined({ title, type, eventName, startDate, endDate, isCurrent, description }),
    });

    const organization = await this._organizationRepository.findById(existing.organizationId);
    const errors = updated.validate({ group: organization.group, now: this._now() });
    if (errors.length) {
      throw new ValidationError('Some fields are invalid.', errors);
    }

    return this._positionRepository.update(id, updated);
  }
}

module.exports = UpdatePosition;
