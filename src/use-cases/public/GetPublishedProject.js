const NotFoundError = require('../../exceptions/NotFoundError');

class GetPublishedProject {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  // Project yang belum terbit diperlakukan seperti tidak ada (tidak membocorkan draf).
  async execute(id) {
    const project = await this._projectRepository.findById(id);
    if (!project || !project.isPublished) {
      throw new NotFoundError(`Project with id ${id} was not found.`);
    }
    return project;
  }
}

module.exports = GetPublishedProject;
