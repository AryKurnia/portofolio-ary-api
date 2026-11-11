class ListPublishedProjects {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  async execute({ page = 1, limit = 12 } = {}) {
    return this._projectRepository.findAll({ page, limit, publishedOnly: true });
  }
}

module.exports = ListPublishedProjects;
