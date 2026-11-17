const NotFoundError = require('../../exceptions/NotFoundError');

class DeleteOrganization {
  constructor(organizationRepository) {
    this._organizationRepository = organizationRepository;
  }

  // Posisi di dalamnya ikut terhapus (UI menampilkan dialog konfirmasi).
  async execute(id) {
    const existing = await this._organizationRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Organization with id ${id} was not found.`);
    }
    await this._organizationRepository.delete(id);
  }
}

module.exports = DeleteOrganization;
