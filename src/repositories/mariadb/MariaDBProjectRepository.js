const ProjectRepository = require('../ProjectRepository');
const Project = require('../../entities/Project');
const ProjectModel = require('../../infrastructure/db/models/Project');
const reorderBySortOrder = require('./reorderBySortOrder');

const Media = require('../../entities/Media');

const toProject = (row) => {
  const { image, ...data } = row.toJSON();
  return new Project({ ...data, image: image ? new Media(image) : null });
};

const toColumns = (project) => ({
  title: project.title,
  description: project.description,
  imageMediaId: project.imageMediaId,
  linkUrl: project.linkUrl,
  showButton: project.showButton,
  isPublished: project.isPublished,
  sortOrder: project.sortOrder,
});

class MariaDBProjectRepository extends ProjectRepository {
  constructor(projectModel = ProjectModel) {
    super();
    this._model = projectModel;
    this._withImage = { include: [{ association: 'image' }] };
    this._order = [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  async findAll({ page = 1, limit = 12, publishedOnly = false } = {}) {
    const { rows, count } = await this._model.findAndCountAll({
      ...this._withImage,
      where: publishedOnly ? { isPublished: true } : {},
      order: this._order,
      offset: (page - 1) * limit,
      limit,
    });
    return { data: rows.map(toProject), meta: { page, limit, total: count } };
  }

  async findAllIds() {
    const rows = await this._model.findAll({ attributes: ['id'] });
    return rows.map((row) => row.id);
  }

  async findById(id) {
    const row = await this._model.findByPk(id, this._withImage);
    return row ? toProject(row) : null;
  }

  async create(project) {
    const row = await this._model.create(toColumns(project));
    return this.findById(row.id);
  }

  async update(id, project) {
    await this._model.update(toColumns(project), { where: { id } });
    return this.findById(id);
  }

  async delete(id) {
    await this._model.destroy({ where: { id } });
  }

  async reorder(orderedIds) {
    await reorderBySortOrder(this._model, orderedIds);
  }
}

module.exports = MariaDBProjectRepository;
