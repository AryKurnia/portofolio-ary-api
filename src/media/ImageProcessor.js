class ImageProcessor {
  /**
   * Memeriksa isi file dan menyiapkan varian yang akan disimpan.
   * → { mime, width, height, variants: [{ name, buffer, contentType, extension }] }
   *   varian diurutkan dari terkecil ke terbesar; varian terakhir = versi utama.
   * Melempar UnsupportedMediaTypeError bila format tidak diizinkan untuk jenis media itu.
   */
  async process({ buffer, kind }) {
    throw new Error(`${this.constructor.name}.process belum diimplementasikan`);
  }
}

module.exports = ImageProcessor;
