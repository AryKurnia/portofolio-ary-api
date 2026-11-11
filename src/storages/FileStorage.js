class FileStorage {
  // API lama (dipakai endpoint /skills/{id}/logo sampai diganti di M5 bagian 3).
  async upload({ buffer, filename, mimeType, folder }) {
    throw new Error(`${this.constructor.name}.upload belum diimplementasikan`);
  }

  async delete(path) {
    throw new Error(`${this.constructor.name}.delete belum diimplementasikan`);
  }

  // API media (M4): bekerja dengan object key, bukan URL.
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
