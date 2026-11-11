const PositionRepository = require('../PositionRepository');
const PositionModel = require('../../infrastructure/db/models/Position');
const { toPosition, toPositionColumns } = require('./timelineMapping');

class MariaDBPositionRepository extends PositionRepository {
  constructor(positionModel = PositionModel) {
    super();
    this._model = positionModel;
  }

  async findById(id) {
    const row = await this._model.findByPk(id);
    return row ? toPosition(row) : null;
  }

  async create(position) {
    const row = await this._model.create({
      organizationId: position.organizationId,
      ...toPositionColumns(position),
    });
    return this.findById(row.id);
  }

  async update(id, position) {
    await this._model.update(toPositionColumns(position), { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(organizationId, orderedIds) {
    await this._model.sequelize.transaction(async (transaction) => {
      for (const [index, id] of orderedIds.entries()) {
        await this._model.update(
          { sortOrder: index + 1 },
          { where: { id, organizationId }, transaction }
        );
      }
    });
  }
}

module.exports = MariaDBPositionRepository;
