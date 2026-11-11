const NotFoundError = require('../../exceptions/NotFoundError');

class GetProject {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  async execute(id) {
    const project = await this._projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError(`Project with id ${id} was not found.`);
    }
    return project;
  }
}

module.exports = GetProject;
