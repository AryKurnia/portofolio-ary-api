const assertCompleteOrder = require('../assertCompleteOrder');

class ReorderProjects {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  async execute(ids) {
    assertCompleteOrder(await this._projectRepository.findAllIds(), ids, 'project');
    await this._projectRepository.reorder(ids);
  }
}

module.exports = ReorderProjects;
