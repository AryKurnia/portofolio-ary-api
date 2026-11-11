const NotFoundError = require('../../exceptions/NotFoundError');

class DeleteSkill {
  constructor(skillRepository, fileStorage, logger) {
    this._skillRepository = skillRepository;
    this._fileStorage = fileStorage;
    this._logger = logger;
  }

  async execute(id) {
    const existingSkill = await this._skillRepository.findById(id);
    if (!existingSkill) {
      throw new NotFoundError(`Skill with id ${id} was not found.`);
    }

    // Hapus data dulu: kalau langkah ini gagal, skill dan logonya tetap utuh.
    await this._skillRepository.delete(id);

    // Hapus file bersifat best-effort: kegagalan hanya menyisakan file yatim (tidak terlihat
    // pengguna), jadi request tetap sukses dan kegagalannya cukup dicatat.
    if (existingSkill.logoUrl) {
      try {
        await this._fileStorage.delete(existingSkill.logoUrl);
      } catch (error) {
        this._logger.warn(
          { err: error, skillId: id, logoUrl: existingSkill.logoUrl },
          'Gagal menghapus logo skill dari storage; file menjadi yatim'
        );
      }
    }
  }
}

module.exports = DeleteSkill;
