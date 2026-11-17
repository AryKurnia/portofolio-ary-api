const NotFoundError = require('../../exceptions/NotFoundError');

class GetSkill {
  constructor({ skillRepository }) {
    this._skillRepository = skillRepository;
  }

  async execute(id) {
    const skill = await this._skillRepository.findById(id);
    if (!skill) {
      throw new NotFoundError(`Skill with id ${id} was not found.`);
    }
    return skill;
  }
}

module.exports = GetSkill;
