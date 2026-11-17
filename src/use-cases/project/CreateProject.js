const Project = require('../../entities/Project');
const validateProject = require('./validateProject');

class CreateProject {
  constructor(projectRepository, mediaRepository) {
    this._projectRepository = projectRepository;
    this._mediaRepository = mediaRepository;
  }

  // Default show_button mengikuti ada/tidaknya link; default is_published = true (API.md §2.6).
  async execute({ title, description, imageMediaId, linkUrl, showButton, isPublished }) {
    const project = new Project({
      title,
      description,
      imageMediaId,
      linkUrl,
      showButton,
      isPublished,
    });
    await validateProject(project, this._mediaRepository);
    return this._projectRepository.create(project);
  }
}

module.exports = CreateProject;
