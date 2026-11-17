const crypto = require('node:crypto');

const PUBLIC_CACHE_CONTROL = 'public, max-age=60, stale-while-revalidate=300';

/**
 * Respons GET publik yang boleh di-cache (API.md §9): Cache-Control + ETag dari isi body.
 * Hapi otomatis membalas 304 Not Modified bila If-None-Match klien cocok.
 */
const cachedResponse = (h, body) => {
  const etag = crypto.createHash('sha1').update(JSON.stringify(body)).digest('base64url');
  return h.response(body).etag(etag).header('Cache-Control', PUBLIC_CACHE_CONTROL);
};

module.exports = { cachedResponse, PUBLIC_CACHE_CONTROL };
