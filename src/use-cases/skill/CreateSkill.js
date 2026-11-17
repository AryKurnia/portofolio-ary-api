const Skill = require('../../entities/Skill');
const validateSkill = require('./validateSkill');
const nextSortOrder = require('./nextSortOrder');

class CreateSkill {
  constructor(deps) {
    this._deps = deps;
  }

  async execute({ categoryId, name, logoMediaId, isPublished }) {
    const skill = new Skill({ categoryId, name, logoMediaId, isPublished });
    await validateSkill(skill, this._deps);
    skill.sortOrder = await nextSortOrder(this._deps.skillRepository, categoryId);
    return this._deps.skillRepository.create(skill);
  }
}

module.exports = CreateSkill;
