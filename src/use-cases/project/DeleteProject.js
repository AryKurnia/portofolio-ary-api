const NotFoundError = require('../../exceptions/NotFoundError');

// File gambar dibersihkan oleh job media yatim (M4), bukan di sini.
class DeleteProject {
  constructor(projectRepository) {
    this._projectRepository = projectRepository;
  }

  async execute(id) {
    const existing = await this._projectRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Project with id ${id} was not found.`);
    }
    await this._projectRepository.delete(id);
  }
}

module.exports = DeleteProject;
