const OrganizationRepository = require('../OrganizationRepository');
const OrganizationModel = require('../../infrastructure/db/models/Organization');
const { toOrganization } = require('./timelineMapping');

class MariaDBOrganizationRepository extends OrganizationRepository {
  constructor(organizationModel = OrganizationModel) {
    super();
    this._model = organizationModel;
    this._withPositions = { include: [{ association: 'positions' }] };
  }

  async findAll({ group } = {}) {
    const rows = await this._model.findAll({
      ...this._withPositions,
      where: group ? { group } : {},
      order: [['id', 'ASC']],
    });
    return rows.map(toOrganization);
  }

  async findById(id) {
    const row = await this._model.findByPk(id, this._withPositions);
    return row ? toOrganization(row) : null;
  }

  async findByNameAndGroup(name, group) {
    const row = await this._model.findOne({ ...this._withPositions, where: { name, group } });
    return row ? toOrganization(row) : null;
  }

  async create(organization) {
    const row = await this._model.create({
      name: organization.name,
      group: organization.group,
      location: organization.location,
      sortOrder: organization.sortOrder,
    });
    return this.findById(row.id);
  }

  async update(id, organization) {
    await this._model.update(
      {
        name: organization.name,
        location: organization.location,
        sortOrder: organization.sortOrder,
      },
      { where: { id } }
    );
    return this.findById(id);
  }

  async delete(id) {
    // Posisi ikut terhapus oleh ON DELETE CASCADE di database.
    await this._model.destroy({ where: { id } });
  }
}

module.exports = MariaDBOrganizationRepository;
