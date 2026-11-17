class FileStorage {
  // Bekerja dengan object key (bukan URL); URL publik dibentuk lewat getPublicUrl.
  // contentDisposition opsional, mis. 'inline' agar PDF dibuka di tab browser, bukan diunduh.
  async putObject({ key, buffer, contentType, cacheControl, contentDisposition }) {
    throw new Error(`${this.constructor.name}.putObject belum diimplementasikan`);
  }

  async deleteObject(key) {
    throw new Error(`${this.constructor.name}.deleteObject belum diimplementasikan`);
  }

  getPublicUrl(key) {
    throw new Error(`${this.constructor.name}.getPublicUrl belum diimplementasikan`);
  }
}

module.exports = FileStorage;
