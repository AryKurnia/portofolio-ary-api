const Repository = require('./Repository');

// key-nya platform (string), bukan integer id — sesuai keputusan kita di OpenAPI
class SocialMediaRepository extends Repository {
  async findAll() { this._notImplemented('findAll'); }
  async findByPlatform(platform) { this._notImplemented('findByPlatform'); }
  async update(platform, socialMedia) { this._notImplemented('update'); }
}

module.exports = SocialMediaRepository;
