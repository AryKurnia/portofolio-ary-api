const NotFoundError = require('../../exceptions/NotFoundError');
const ValidationError = require('../../exceptions/ValidationError');

class ReorderPositions {
  constructor(organizationRepository, positionRepository) {
    this._organizationRepository = organizationRepository;
    this._positionRepository = positionRepository;
  }

  // ids harus memuat SEMUA posisi organisasi tepat satu kali (hasil drag & drop).
  async execute(organizationId, ids) {
    const organization = await this._organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError(`Organization with id ${organizationId} was not found.`);
    }

    const currentIds = organization.positions.map((position) => position.id).sort((a, b) => a - b);
    const requestedIds = [...ids].sort((a, b) => a - b);
    const isSamePermutation =
      currentIds.length === requestedIds.length &&
      currentIds.every((id, index) => id === requestedIds[index]);
    if (!isSamePermutation) {
      throw new ValidationError('Some fields are invalid.', [
        {
          field: 'ids',
          message: 'ids must contain every position of this organization exactly once.',
        },
      ]);
    }

    await this._positionRepository.reorder(organizationId, ids);
  }
}

module.exports = ReorderPositions;
