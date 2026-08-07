// const ValidationError = require('../../errors/validationError');

class RegisterUser {
  /**
   * Menginjeksi dependensi yang dibutuhkan oleh use case ini.
   * @param {Object} validator - Objek untuk memvalidasi input.
   * @param {Object} userDAO - Antarmuka akses data (Data Access Object) pengguna.
   * @param {Function} encryptPassword - Fungsi utilitas untuk mengenkripsi kata sandi.
   */
  constructor(validator, userDAO, encryptPassword) {
    this.validator = validator;
    this.userDAO = userDAO;
    this.encryptPassword = encryptPassword;
  }

  /**
   * Menjalankan tugas bisnis pendaftaran pengguna.
   * @param {Object} payload - Data input dari pengguna.
   */
  async call(payload) {
    // 1. Validasi Data Input
    // Use Case meminta validator untuk memeriksa data, tanpa perlu tahu paket apa (misal Joi) yang dipakai di belakangnya.
    const { data, errors } = this.validator.validate(payload);

    if (errors && errors.length > 0) {
      console.error(errors);
      throw new ValidationError('The data is invalid', errors);
    }

    // 2. Hapus data konfirmasi sandi karena tidak perlu disimpan ke dalam database
    delete data.confirmPassword;

    // 3. Enkripsi Kata Sandi
    // Use Case tidak peduli algoritma apa (misal bcrypt) yang digunakan, ia hanya memanggil fungsi enkripsi.
    const { password, salt } = await this.encryptPassword(data.password);

    // 4. Susun Format Data Pengguna Baru
    Object.assign(data, {
      role: 'user', // Set peran default sebagai pengguna biasa
      password,
      salt,
    });

    // 5. Simpan Data ke Database
    // Operasi penyimpanan dilakukan secara ketat melalui DAO, yang nantinya akan mengembalikan *instance* Entitas.
    return this.userDAO.create(data);
  }
}

module.exports = RegisterUser;