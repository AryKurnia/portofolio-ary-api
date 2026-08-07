const NotFoundError = require('../../exceptions/NotFoundError');

class DeleteSkill {
  constructor(skillRepository, fileStorage) {
    this._skillRepository = skillRepository;
    this._fileStorage = fileStorage;
  }

  async execute(id) {
    const existingSkill = await this._skillRepository.findById(id);
    if (!existingSkill) {
      throw new NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    if (existingSkill.logoUrl) {
      await this._fileStorage.delete(existingSkill.logoUrl);
    }

    return this._skillRepository.delete(id);
  }
}

module.exports = DeleteSkill;
