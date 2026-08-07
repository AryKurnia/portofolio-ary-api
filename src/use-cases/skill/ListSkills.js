class ListSkills {
  constructor(skillRepository) {
    this._skillRepository = skillRepository;
  }

  async execute({ page = 1, limit = 10 } = {}) {
    return this._skillRepository.findAll({ page, limit });
  }
}

module.exports = ListSkills;
