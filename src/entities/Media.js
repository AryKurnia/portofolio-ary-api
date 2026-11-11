const Entity = require('./Entity');

/**
 * Aturan per jenis media: lebar varian WebP yang dibuat, dan apakah SVG diizinkan (K7: hanya
 * logo skill, setelah disanitasi).
 */
const KIND_RULES = {
  project_image: { widths: [400, 800, 1200], allowSvg: false },
  skill_logo: { widths: [128, 256], allowSvg: true },
  profile_photo: { widths: [400, 800], allowSvg: false },
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

module.exports = Media;
