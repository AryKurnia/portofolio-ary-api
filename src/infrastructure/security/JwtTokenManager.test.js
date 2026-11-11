const crypto = require('node:crypto');
const Jwt = require('@hapi/jwt');
const JwtTokenManager = require('./JwtTokenManager');

describe('JwtTokenManager', () => {
  const now = new Date('2026-11-11T00:00:00Z');
  const createManager = () =>
    new JwtTokenManager({
      secret: 'secret-khusus-tes-yang-panjangnya-32+',
      audience: 'urn:tes',
      issuer: 'tes',
      accessTokenTtlSeconds: 900,
      refreshTokenTtlSeconds: 604800,
      now: () => now,
    });

  it('membuat access token HS256 yang bisa diverifikasi dan berisi sub + username', () => {
    // ACT
    const { token, expiresIn } = createManager().createAccessToken({ id: 1, username: 'admin' });

    // ASSERT
    const artifacts = Jwt.token.decode(token);
    expect(() =>
      Jwt.token.verify(
        artifacts,
        { key: 'secret-khusus-tes-yang-panjangnya-32+', algorithm: 'HS256' },
        { aud: 'urn:tes', iss: 'tes' }
      )
    ).not.toThrow();
    expect(artifacts.decoded.payload).toEqual(
      expect.objectContaining({ sub: '1', username: 'admin', aud: 'urn:tes', iss: 'tes' })
    );
    expect(expiresIn).toBe(900);
  });

  it('membuat refresh token acak beserta hash SHA-256 dan waktu kedaluwarsa', () => {
    // ACT
    const first = createManager().createRefreshToken();
    const second = createManager().createRefreshToken();

    // ASSERT
    expect(first.token).not.toBe(second.token);
    expect(first.token.length).toBeGreaterThanOrEqual(43); // 32 byte base64url
    expect(first.tokenHash).toBe(crypto.createHash('sha256').update(first.token).digest('hex'));
    expect(first.expiresAt).toEqual(new Date('2026-11-18T00:00:00Z'));
  });

  it('hash refresh token konsisten untuk token yang sama', () => {
    // ARRANGE
    const manager = createManager();

    // ASSERT
    expect(manager.hashRefreshToken('abc')).toBe(manager.hashRefreshToken('abc'));
    expect(manager.hashRefreshToken('abc')).not.toBe(manager.hashRefreshToken('abd'));
  });
});
