const Skill = require('../../entities/Skill');

class CreateSkill {
  constructor(skillRepository) {
    this._skillRepository = skillRepository;
  }

  async execute({ name, logoUrl, description, enabled }) {
    const skill = new Skill({ name, logoUrl, description, enabled });
    return this._skillRepository.save(skill);
  }
}

module.exports = CreateSkill;
