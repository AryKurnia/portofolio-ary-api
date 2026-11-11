// Alur auth ujung-ke-ujung dengan aplikasi asli dan database tes (tanpa mock).
const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const { sequelize, assertTestDatabase, query } = require('./db');
const { createServer } = require('../../src/server');

describe('Alur auth admin (MariaDB tes)', () => {
  const USERNAME = 'integration-admin';
  const password = crypto.randomBytes(12).toString('base64url');
  let server;
  let userId;

  const login = (pw = password, username = USERNAME) =>
    server.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/login',
      payload: { username, password: pw },
    });
  const refresh = (cookie) =>
    server.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/refresh',
      headers: cookie ? { cookie } : {},
    });
  const cookieOf = (res) =>
    [res.headers['set-cookie']]
      .flat()
      .find((c) => c?.startsWith('refresh_token='))
      ?.split(';')[0];

  beforeAll(async () => {
    await assertTestDatabase();
    await query('DELETE FROM users WHERE username = ?', [USERNAME]);
    // Hash cost 4 sengaja rendah agar rehash ke cost 12 ikut teruji.
    await query(
      'INSERT INTO users (username, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [USERNAME, 'integration-admin@example.com', await bcrypt.hash(password, 4)]
    );
    [{ id: userId }] = await query('SELECT id FROM users WHERE username = ?', [USERNAME]);
    server = await createServer();
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE username = ?', [USERNAME]); // refresh_tokens ikut (CASCADE)
    await sequelize.close();
  });

  it('menolak password salah dan username yang tidak ada dengan pesan yang sama', async () => {
    const wrongPassword = await login('salah');
    const unknownUser = await login(password, 'tidak-ada');
    expect(wrongPassword.statusCode).toBe(401);
    expect(unknownUser.statusCode).toBe(401);
    expect(unknownUser.result.error.message).toBe(wrongPassword.result.error.message);
  });

  it('login berhasil, meng-upgrade hash ke cost 12, dan menyimpan refresh token sebagai hash', async () => {
    const response = await login();
    const cookie = cookieOf(response);

    expect(response.statusCode).toBe(200);
    expect(response.result.data.admin).toEqual({ id: userId, username: USERNAME });
    const [{ hash }] = await query('SELECT password_hash AS hash FROM users WHERE id = ?', [
      userId,
    ]);
    expect(bcrypt.getRounds(hash)).toBe(12);
    const tokens = await query('SELECT token_hash FROM refresh_tokens WHERE user_id = ?', [userId]);
    expect(tokens.map((t) => t.token_hash)).not.toContain(cookie.split('=')[1]);
  });

  it('rotasi refresh token, deteksi pemakaian ulang, lalu semua sesi dicabut', async () => {
    const first = cookieOf(await login());
    const otherSession = cookieOf(await login());

    const rotated = await refresh(first);
    const second = cookieOf(rotated);
    expect(rotated.statusCode).toBe(200);
    expect(second).not.toBe(first);

    expect((await refresh(first)).statusCode).toBe(401); // token lama dipakai ulang
    expect((await refresh(second)).statusCode).toBe(401); // sesi terbaru ikut dicabut
    expect((await refresh(otherSession)).statusCode).toBe(401); // sesi lain juga
  });

  it('GET /me dengan access token, dan logout mencabut sesi', async () => {
    const response = await login();
    const me = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/auth/me',
      headers: { authorization: `Bearer ${response.result.data.access_token}` },
    });
    expect(me.result.data.username).toBe(USERNAME);

    const cookie = cookieOf(response);
    const logout = await server.inject({
      method: 'POST',
      url: '/api/v1/admin/auth/logout',
      headers: { cookie },
    });
    expect(logout.statusCode).toBe(204);
    expect((await refresh(cookie)).statusCode).toBe(401);
  });
});
