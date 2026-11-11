const NotFoundError = require('../../exceptions/NotFoundError');

// File logo tidak dihapus di sini: media yang tidak lagi dirujuk dibersihkan oleh
// `npm run media:cleanup` (M4).
class DeleteSkill {
  constructor({ skillRepository }) {
    this._skillRepository = skillRepository;
  }

  async execute(id) {
    const existing = await this._skillRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Skill with id ${id} was not found.`);
    }
    await this._skillRepository.delete(id);
  }
}

module.exports = DeleteSkill;
