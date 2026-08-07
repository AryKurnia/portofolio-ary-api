const Skill = require('../../entities/Skill');
const NotFoundError = require('../../exceptions/NotFoundError');

class UploadSkillLogo {
  constructor(skillRepository, fileStorage) {
    this._skillRepository = skillRepository;
    this._fileStorage = fileStorage;
  }

  async execute({ id, buffer, filename, mimeType }) {
    const existingSkill = await this._skillRepository.findById(id);
    if (!existingSkill) {
      throw new NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    const logoUrl = await this._fileStorage.upload({
      buffer,
      filename,
      mimeType,
      folder: 'skills',
    });

    const updatedSkill = new Skill({ ...existingSkill, logoUrl });
    return this._skillRepository.update(id, updatedSkill);
  }
}

module.exports = UploadSkillLogo;
