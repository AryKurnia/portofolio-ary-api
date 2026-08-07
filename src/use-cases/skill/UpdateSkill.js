const Skill = require('../../entities/Skill');
const NotFoundError = require('../../exceptions/NotFoundError');

class UpdateSkill {
  constructor(skillRepository) {
    this._skillRepository = skillRepository;
  }

  async execute(id, { name, description, enabled }) {
    const existingSkill = await this._skillRepository.findById(id);
    if (!existingSkill) {
      throw new NotFoundError(`Skill dengan id ${id} tidak ditemukan`);
    }

    const updatedSkill = new Skill({
      ...existingSkill,
      name,
      description,
      enabled,
    });

    return this._skillRepository.update(id, updatedSkill);
  }
}

module.exports = UpdateSkill;