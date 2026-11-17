class ListSkills {
  constructor({ skillRepository }) {
    this._skillRepository = skillRepository;
  }

  async execute({ categoryId } = {}) {
    return this._skillRepository.findAll({ categoryId });
  }
}

module.exports = ListSkills;
