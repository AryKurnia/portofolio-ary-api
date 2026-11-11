const ProjectRepository = require('../ProjectRepository');
const Project = require('../../entities/Project');
const ProjectModel = require('../../infrastructure/db/models/Project');
const reorderBySortOrder = require('./reorderBySortOrder');

const toProject = (row) => new Project(row.toJSON());

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
    this._order = [
      ['sortOrder', 'ASC'],
      ['createdAt', 'DESC'],
      ['id', 'DESC'],
    ];
  }

  async findAll({ page = 1, limit = 12 } = {}) {
    const { rows, count } = await this._model.findAndCountAll({
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
    const row = await this._model.findByPk(id);
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
