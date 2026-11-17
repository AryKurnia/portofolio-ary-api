const Repository = require('./Repository');

class SocialLinkRepository extends Repository {
  async findAll({ publishedOnly } = {}) {
    this._notImplemented('findAll');
  }

  async findById(id) {
    this._notImplemented('findById');
  }

  async create(socialLink) {
    this._notImplemented('create');
  }

  async update(id, socialLink) {
    this._notImplemented('update');
  }

  async delete(id) {
    this._notImplemented('delete');
  }

  async reorder(orderedIds) {
    this._notImplemented('reorder');
  }
}

module.exports = SocialLinkRepository;
