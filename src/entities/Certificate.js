const Entity = require('./Entity');

// Tanggal dalam format 'YYYY-MM' (string), sehingga bisa dibandingkan secara leksikografis.
const toYearMonth = (date) => date.toISOString().slice(0, 7);

class Certificate extends Entity {
  constructor({
    name,
    issuer,
    issuedAt,
    expiresAt = null,
    credentialId = null,
    credentialUrl = null,
    fileMediaId = null,
    isPublished = false,
    sortOrder = 0,
    ...attrs
  } = {}) {
    super(attrs);
    this.name = name;
    this.issuer = issuer;
    this.issuedAt = issuedAt;
    this.expiresAt = expiresAt;
    this.credentialId = credentialId;
    this.credentialUrl = credentialUrl;
    this.fileMediaId = fileMediaId;
    this.isPublished = isPublished;
    this.sortOrder = sortOrder;
  }

  /**
   * Aturan bisnis sertifikat. Mengembalikan [{ field, message }]; kosong = valid.
   * Pesan sama dengan teks error di desain (Panel Certificate).
   */
  validate({ now = new Date() } = {}) {
    const errors = [];
    if (this.expiresAt && this.expiresAt < this.issuedAt) {
      errors.push({ field: 'expires_at', message: 'Expiry must be after the issue date.' });
    }
    if (this.issuedAt > toYearMonth(now)) {
      errors.push({ field: 'issued_at', message: 'Issue date cannot be in the future.' });
    }
    // Sertifikat yang terbit harus bisa dibuka: lewat file (View) atau halaman penerbit (Verify).
    if (this.isPublished && !this.fileMediaId && !this.credentialUrl) {
      errors.push({ field: 'file_id', message: 'Add a file or a credential URL to publish.' });
    }
    return errors;
  }
}

module.exports = Certificate;
