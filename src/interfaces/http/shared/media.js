const container = require('../../../infrastructure/container');

/**
 * Objek gambar untuk respons API: URL versi utama + URL setiap varian ukuran.
 * Varian WebP berkunci lebar ("400", "800", ...) untuk srcset; SVG hanya punya "original".
 */
const toImageResponse = (media) => {
  if (!media) return null;
  const urlFor = container.mediaUrlFor;
  return {
    id: media.id,
    url: urlFor(media.objectKey),
    width: media.width,
    height: media.height,
    mime: media.mime,
    variants: Object.fromEntries(
      Object.entries(media.variants ?? {}).map(([name, key]) => [name, urlFor(key)])
    ),
  };
};

module.exports = { toImageResponse };
