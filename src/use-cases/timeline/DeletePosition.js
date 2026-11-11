const NotFoundError = require('../../exceptions/NotFoundError');

class DeletePosition {
  constructor(positionRepository) {
    this._positionRepository = positionRepository;
  }

  async execute(id) {
    const existing = await this._positionRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Position with id ${id} was not found.`);
    }
    await this._positionRepository.delete(id);
  }
}

module.exports = DeletePosition;
