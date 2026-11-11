const sharp = require('sharp');
const ImageProcessor = require('../../media/ImageProcessor');
const Media = require('../../entities/Media');
const UnsupportedMediaTypeError = require('../../exceptions/UnsupportedMediaTypeError');
const ValidationError = require('../../exceptions/ValidationError');
const { looksLikeSvg, sanitizeSvg } = require('./svgSanitizer');

// Batas piksel input (mis. 6000×6000) — mencegah "decompression bomb" menghabiskan memori.
const MAX_INPUT_PIXELS = 36_000_000;
const RASTER_FORMATS = ['png', 'jpeg', 'webp'];
const WEBP_QUALITY = 80;
const EMBEDDED_BITMAP = /<image\b[^>]*\bhref\s*=\s*["']\s*data:image\//i;

class SharpImageProcessor extends ImageProcessor {
  async process({ buffer, kind }) {
    const rules = Media.KIND_RULES[kind];
    return looksLikeSvg(buffer)
      ? this._processSvg(buffer, rules)
      : this._processRaster(buffer, rules);
  }

  async _processSvg(buffer, rules) {
    if (!rules.allowSvg) {
      throw new UnsupportedMediaTypeError(
        'SVG is only allowed for skill logos. Use PNG, JPG or WebP.'
      );
    }
    const text = buffer.toString('utf8');
    // SVG ekspor desain sering hanya membungkus bitmap sebagai data: URL. Sanitizer membuang
    // data: URL (jalur XSS), sehingga hasilnya akan kosong — tolak dengan pesan yang jelas.
    if (EMBEDDED_BITMAP.test(text)) {
      throw new UnsupportedMediaTypeError(
        'This SVG only wraps an embedded bitmap image. Upload the PNG/JPG/WebP file directly or use a vector SVG.'
      );
    }
    const clean = sanitizeSvg(text);
    if (!clean) {
      throw new UnsupportedMediaTypeError('The SVG file is invalid.');
    }

    const output = Buffer.from(clean, 'utf8');
    const metadata = await sharp(output)
      .metadata()
      .catch(() => ({}));
    return {
      mime: 'image/svg+xml',
      width: metadata.width ?? null,
      height: metadata.height ?? null,
      variants: [
        { name: 'original', buffer: output, contentType: 'image/svg+xml', extension: 'svg' },
      ],
    };
  }

  async _processRaster(buffer, rules) {
    const metadata = await this._readMetadata(buffer);
    if (!RASTER_FORMATS.includes(metadata.format)) {
      throw new UnsupportedMediaTypeError(
        rules.allowSvg ? 'Use PNG, JPG, WebP or SVG.' : 'Use PNG, JPG or WebP.'
      );
    }

    const variants = [];
    for (const width of rules.widths) {
      // rotate() menerapkan orientasi EXIF; metadata (termasuk lokasi GPS) tidak ikut disimpan.
      const output = await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS })
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();
      variants.push({
        name: String(width),
        buffer: output,
        contentType: 'image/webp',
        extension: 'webp',
      });
    }

    const oriented = metadata.autoOrient ?? metadata;
    return { mime: 'image/webp', width: oriented.width, height: oriented.height, variants };
  }

  async _readMetadata(buffer) {
    try {
      return await sharp(buffer, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    } catch (error) {
      if (/pixel limit/i.test(error.message)) {
        throw new ValidationError('Some fields are invalid.', [
          { field: 'file', message: 'Image dimensions are too large (max 36 megapixels).' },
        ]);
      }
      throw new UnsupportedMediaTypeError('The file is not a supported image.');
    }
  }
}

SharpImageProcessor.MAX_INPUT_PIXELS = MAX_INPUT_PIXELS;

module.exports = SharpImageProcessor;
