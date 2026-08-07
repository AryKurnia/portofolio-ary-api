const Repository = require('./Repository');

class JobRepository extends Repository {
  async findAll() { this._notImplemented('findAll'); }
  async findById(id) { this._notImplemented('findById'); }
  async save(job) { this._notImplemented('save'); }
  async update(id, job) { this._notImplemented('update'); }
  async delete(id) { this._notImplemented('delete'); }
}

module.exports = JobRepository;
