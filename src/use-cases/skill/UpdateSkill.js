const Skill = require('../../entities/Skill');
const NotFoundError = require('../../exceptions/NotFoundError');
const pickDefined = require('../pickDefined');
const validateSkill = require('./validateSkill');
const nextSortOrder = require('./nextSortOrder');

class UpdateSkill {
  constructor(deps) {
    this._deps = deps;
  }

  // Aturan divalidasi terhadap gabungan data lama + perubahan. Pindah kategori → urutan terakhir.
  async execute(id, { categoryId, name, logoMediaId, isPublished }) {
    const { skillRepository } = this._deps;
    const existing = await skillRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Skill with id ${id} was not found.`);
    }

    const updated = new Skill({
      ...existing,
      ...pickDefined({ categoryId, name, logoMediaId, isPublished }),
    });
    await validateSkill(updated, this._deps, id);
    if (updated.categoryId !== existing.categoryId) {
      updated.sortOrder = await nextSortOrder(skillRepository, updated.categoryId);
    }
    return skillRepository.update(id, updated);
  }
}

module.exports = UpdateSkill;
