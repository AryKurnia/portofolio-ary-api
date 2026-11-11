const Entity = require('./Entity');

class Project extends Entity {
  constructor({
    title,
    description,
    imageMediaId = null,
    linkUrl = null,
    showButton = Boolean(linkUrl),
    isPublished = true,
    sortOrder = 0,
    ...attrs
  } = {}) {
    super(attrs);
    this.title = title;
    this.description = description;
    this.imageMediaId = imageMediaId;
    this.linkUrl = linkUrl;
    this.showButton = showButton;
    this.isPublished = isPublished;
    this.sortOrder = sortOrder;
  }

  /**
   * Aturan bisnis project. Mengembalikan [{ field, message }]; kosong = valid.
   * - Tombol "Visit" hanya bila ada link (API.md §3 no. 3).
   * - Project yang terbit wajib punya gambar (kartu portofolio selalu menampilkan gambar).
   */
  validate() {
    const errors = [];
    if (this.showButton && !this.linkUrl) {
      errors.push({ field: 'show_button', message: 'The visit button requires a link URL.' });
    }
    if (this.isPublished && !this.imageMediaId) {
      errors.push({ field: 'image_id', message: 'A published project requires an image.' });
    }
    return errors;
  }
}

module.exports = Project;
