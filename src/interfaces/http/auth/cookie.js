const config = require('../../../config');

const REFRESH_TOKEN_COOKIE = 'refresh_token';

// Cookie refresh token hanya dikirim browser ke endpoint auth (path), tidak bisa dibaca
// JavaScript (HttpOnly), dan tidak ikut request lintas situs (SameSite=Strict).
const refreshTokenCookieOptions = (path) => ({
  ttl: config.auth.refreshTokenTtlSeconds * 1000,
  path,
  isHttpOnly: true,
  isSecure: config.auth.cookieSecure,
  isSameSite: 'Strict',
  encoding: 'none',
  strictHeader: true,
  clearInvalid: true,
  ignoreErrors: true,
});

module.exports = { REFRESH_TOKEN_COOKIE, refreshTokenCookieOptions };
