class PasswordHasher {
  async hash(plainPassword) {
    throw new Error(`${this.constructor.name}.hash belum diimplementasikan`);
  }

  // hash boleh null (user tidak ditemukan): implementasi tetap melakukan perbandingan
  // palsu agar waktu respons tidak membocorkan username mana yang ada.
  async compare(plainPassword, hash) {
    throw new Error(`${this.constructor.name}.compare belum diimplementasikan`);
  }

  needsRehash(hash) {
    throw new Error(`${this.constructor.name}.needsRehash belum diimplementasikan`);
  }
}

module.exports = PasswordHasher;
