const Project = require('../../entities/Project');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');
const validateProject = require('./validateProject');

class UpdateProject {
  constructor(projectRepository, mediaRepository) {
    this._projectRepository = projectRepository;
    this._mediaRepository = mediaRepository;
  }

  // Aturan divalidasi terhadap gabungan data lama + perubahan.
  async execute(id, { title, description, imageMediaId, linkUrl, showButton, isPublished }) {
    const existing = await this._projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Project with id ${id} was not found.`);
    }

    const updated = new Project({
      ...existing,
      ...pickDefined({ title, description, imageMediaId, linkUrl, showButton, isPublished }),
    });
    await validateProject(updated, this._mediaRepository);
    return this._projectRepository.update(id, updated);
  }
}

module.exports = UpdateProject;
