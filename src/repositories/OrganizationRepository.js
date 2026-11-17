const Repository = require('./Repository');

// Organisasi selalu dikembalikan beserta posisinya (entity Organization.positions).
class OrganizationRepository extends Repository {
  async findAll({ group } = {}) {
    this._notImplemented('findAll');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async findByNameAndGroup(name, group) {
    this._notImplemented('findByNameAndGroup');
  }

  async create(organization) {
    this._notImplemented('create');
  }

  async update(id, organization) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }
}

module.exports = OrganizationRepository;
