class FileStorage {
  // Bekerja dengan object key (bukan URL); URL publik dibentuk lewat getPublicUrl.
  async putObject({ key, buffer, contentType, cacheControl }) {
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
