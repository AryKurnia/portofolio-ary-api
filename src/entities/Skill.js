const Entity = require('./Entity');

class Skill extends Entity {
  constructor({
    categoryId,
    name,
    logoMediaId = null,
    isPublished = true,
    sortOrder = 0,
    logo = null,
    ...attrs
  } = {}) {
    super(attrs);
    this.categoryId = categoryId;
    this.name = name;
    this.logoMediaId = logoMediaId;
    this.isPublished = isPublished;
    this.sortOrder = sortOrder;
    this.logo = logo; // Media (hanya untuk dibaca; disimpan lewat logoMediaId)
  }

  // Skill Tile di portofolio selalu menampilkan logo → skill terbit wajib punya logo.
  validate() {
    if (this.isPublished && !this.logoMediaId) {
      return [{ field: 'logo_id', message: 'A published skill requires a logo.' }];
    }
    return [];
  }
}

module.exports = Skill;
