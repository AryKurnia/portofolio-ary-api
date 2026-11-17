jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');
const AuthenticationError = require('../../../exceptions/AuthenticationError');
const UnauthorizedError = require('../../../exceptions/UnauthorizedError');

describe('HTTP routes /api/v1/admin/auth', () => {
  let server;

  const loginResult = {
    accessToken: 'access-token',
    expiresIn: 900,
    refreshToken: 'refresh-token-rahasia',
    refreshTokenExpiresAt: new Date('2026-11-18T00:00:00Z'),
    admin: { id: 1, username: 'admin' },
  };

  const getCookie = (response) =>
    [response.headers['set-cookie']].flat().find((c) => c?.startsWith('refresh_token='));

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /admin/auth/login', () => {
    it('mengembalikan access token + data admin, dan refresh token hanya di cookie', async () => {
      // ARRANGE
      container.loginUser.execute.mockResolvedValue(loginResult);

      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/login',
        payload: { username: 'admin', password: 'rahasia' },
      });

      // ASSERT
      expect(response.statusCode).toBe(200);
      expect(container.loginUser.execute).toHaveBeenCalledWith({
        username: 'admin',
        password: 'rahasia',
      });
      expect(response.result).toEqual({
        data: {
          access_token: 'access-token',
          expires_in: 900,
          admin: { id: 1, username: 'admin' },
        },
      });
      expect(response.payload).not.toContain('refresh-token-rahasia');
    });

    it('memasang cookie refresh_token HttpOnly, SameSite=Strict, dengan path endpoint auth', async () => {
      // ARRANGE
      container.loginUser.execute.mockResolvedValue(loginResult);

      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/login',
        payload: { username: 'admin', password: 'rahasia' },
      });

      // ASSERT
      const cookie = getCookie(response);
      expect(cookie).toContain('refresh_token=refresh-token-rahasia');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/api/v1/admin/auth');
      expect(cookie).toContain('Max-Age=604800');
    });

    it('mengembalikan 401 INVALID_CREDENTIALS tanpa cookie kalau kredensial salah', async () => {
      // ARRANGE
      container.loginUser.execute.mockRejectedValue(
        new AuthenticationError('Invalid username or password.')
      );

      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/login',
        payload: { username: 'admin', password: 'salah' },
      });

      // ASSERT
      expect(response.statusCode).toBe(401);
      expect(response.result.error.code).toBe('INVALID_CREDENTIALS');
      expect(getCookie(response)).toBeUndefined();
    });

    it('mengembalikan 400 kalau masih memakai field email (login kini memakai username)', async () => {
      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/login',
        payload: { email: 'admin@example.com', password: 'rahasia' },
      });

      // ASSERT
      expect(response.statusCode).toBe(400);
      const fields = response.result.error.details.map((detail) => detail.field);
      expect(fields).toEqual(expect.arrayContaining(['username', 'email']));
      expect(container.loginUser.execute).not.toHaveBeenCalled();
    });

    it('path login lama /api/v1/auth/login sudah tidak tersedia', async () => {
      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: { username: 'admin', password: 'x' },
      });

      // ASSERT
      expect(response.statusCode).toBe(404);
    });
  });

  describe('POST /admin/auth/refresh', () => {
    it('membaca cookie, mengembalikan access token baru, dan memasang refresh token baru', async () => {
      // ARRANGE
      container.refreshAccessToken.execute.mockResolvedValue({
        ...loginResult,
        refreshToken: 'refresh-token-baru',
      });

      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/refresh',
        headers: { cookie: 'refresh_token=refresh-token-lama' },
      });

      // ASSERT
      expect(response.statusCode).toBe(200);
      expect(container.refreshAccessToken.execute).toHaveBeenCalledWith('refresh-token-lama');
      expect(response.result).toEqual({ data: { access_token: 'access-token', expires_in: 900 } });
      expect(getCookie(response)).toContain('refresh_token=refresh-token-baru');
    });

    it('mengembalikan 401 UNAUTHORIZED kalau cookie tidak ada', async () => {
      // ARRANGE
      container.refreshAccessToken.execute.mockRejectedValue(
        new UnauthorizedError('Missing refresh token.')
      );

      // ACT
      const response = await server.inject({ method: 'POST', url: '/api/v1/admin/auth/refresh' });

      // ASSERT
      expect(response.statusCode).toBe(401);
      expect(container.refreshAccessToken.execute).toHaveBeenCalledWith(undefined);
      expect(response.result).toEqual({
        error: { code: 'UNAUTHORIZED', message: 'Missing refresh token.' },
      });
    });
  });

  describe('POST /admin/auth/logout', () => {
    it('mencabut token dari cookie dan menghapus cookie', async () => {
      // ARRANGE
      container.logoutUser.execute.mockResolvedValue(undefined);

      // ACT
      const response = await server.inject({
        method: 'POST',
        url: '/api/v1/admin/auth/logout',
        headers: { cookie: 'refresh_token=refresh-token-lama' },
      });

      // ASSERT
      expect(response.statusCode).toBe(204);
      expect(container.logoutUser.execute).toHaveBeenCalledWith('refresh-token-lama');
      const cookie = getCookie(response);
      expect(cookie).toMatch(/^refresh_token=;/);
      expect(cookie).toContain('Max-Age=0');
    });
  });

  describe('GET /admin/auth/me', () => {
    it('mengembalikan data admin dari token', async () => {
      // ARRANGE
      container.getCurrentAdmin.execute.mockResolvedValue({ id: 1, username: 'admin' });

      // ACT
      const response = await server.inject({
        method: 'GET',
        url: '/api/v1/admin/auth/me',
        headers: authHeader(),
      });

      // ASSERT
      expect(response.statusCode).toBe(200);
      expect(container.getCurrentAdmin.execute).toHaveBeenCalledWith(1);
      expect(response.result).toEqual({ data: { id: 1, username: 'admin' } });
    });

    it('mengembalikan 401 tanpa access token', async () => {
      // ACT
      const response = await server.inject({ method: 'GET', url: '/api/v1/admin/auth/me' });

      // ASSERT
      expect(response.statusCode).toBe(401);
      expect(container.getCurrentAdmin.execute).not.toHaveBeenCalled();
    });
  });
});
