class ImageProcessor {
  /**
   * Memeriksa isi file dan menyiapkan varian yang akan disimpan.
   * → { mime, width, height, variants: [{ name, buffer, contentType, extension, contentDisposition? }] }
   *   varian diurutkan dari terkecil ke terbesar; varian terakhir = versi utama.
   *   PDF (hanya jenis yang allowPdf) tidak diproses: satu varian "original", width/height null.
   * Melempar UnsupportedMediaTypeError bila format tidak diizinkan untuk jenis media itu.
   */
  async process({ buffer, kind }) {
    throw new Error(`${this.constructor.name}.process belum diimplementasikan`);
  }
}

module.exports = ImageProcessor;
