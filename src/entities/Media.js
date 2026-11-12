const Entity = require('./Entity');

const MB = 1024 * 1024;

/**
 * Aturan per jenis media:
 * - widths: lebar varian WebP yang dibuat dari gambar bitmap;
 * - allowSvg: SVG diizinkan (K7: hanya logo skill, setelah disanitasi);
 * - allowPdf: PDF disimpan apa adanya (hanya file sertifikat);
 * - maxBytes: ukuran file maksimal.
 */
const KIND_RULES = {
  project_image: { widths: [400, 800, 1200], allowSvg: false, allowPdf: false, maxBytes: 2 * MB },
  skill_logo: { widths: [128, 256], allowSvg: true, allowPdf: false, maxBytes: 2 * MB },
  profile_photo: { widths: [400, 800], allowSvg: false, allowPdf: false, maxBytes: 2 * MB },
  certificate_file: { widths: [800, 1600], allowSvg: false, allowPdf: true, maxBytes: 5 * MB },
};

// variants: { "<lebar>": "<object key>" } atau { original: "<object key>" } untuk SVG.
class Media extends Entity {
  constructor({
    kind,
    objectKey,
    mime,
    sizeBytes,
    width = null,
    height = null,
    variants = {},
    ...attrs
  } = {}) {
    super(attrs);
    this.kind = kind;
    this.objectKey = objectKey;
    this.mime = mime;
    this.sizeBytes = sizeBytes;
    this.width = width;
    this.height = height;
    this.variants = variants;
  }

  get objectKeys() {
    return [...new Set([this.objectKey, ...Object.values(this.variants ?? {})])];
  }
}

Media.KIND_RULES = KIND_RULES;
Media.KINDS = Object.keys(KIND_RULES);
// Batas terbesar di antara semua jenis; batas per jenis dicek oleh use-case UploadMedia.
Media.MAX_BYTES = Math.max(...Object.values(KIND_RULES).map((rules) => rules.maxBytes));

module.exports = Media;
