const Repository = require('./Repository');

class EducationRepository extends Repository {
  async findAll() { this._notImplemented('findAll'); }
  async findById(id) { this._notImplemented('findById'); }
  async save(education) { this._notImplemented('save'); }
  async update(id, education) { this._notImplemented('update'); }
  async delete(id) { this._notImplemented('delete'); }
}

module.exports = EducationRepository;
