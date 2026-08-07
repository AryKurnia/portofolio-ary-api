class FileStorage {
  async upload({ buffer, filename, mimeType, folder }) {
    throw new Error(`${this.constructor.name}.upload belum diimplementasikan`);
  }

  async delete(path) {
    throw new Error(`${this.constructor.name}.delete belum diimplementasikan`);
  }
}

module.exports = FileStorage;
