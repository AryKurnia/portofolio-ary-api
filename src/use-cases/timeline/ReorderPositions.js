const NotFoundError = require('../../exceptions/NotFoundError');
const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderPositions {
  constructor(organizationRepository, positionRepository) {
    this._organizationRepository = organizationRepository;
    this._positionRepository = positionRepository;
  }

  async execute(organizationId, ids) {
    const organization = await this._organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundError(`Organization with id ${organizationId} was not found.`);
    }

    assertCompleteOrder(
      organization.positions.map((position) => position.id),
      ids,
      'position of this organization'
    );
    await this._positionRepository.reorder(organizationId, ids);
  }
}

module.exports = ReorderPositions;
