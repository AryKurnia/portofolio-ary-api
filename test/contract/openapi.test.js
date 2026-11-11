// Tes kontrak: docs/openapi.yaml harus selalu sesuai dengan route dan respons sebenarnya.
// Menambah endpoint/status baru tanpa memperbarui openapi.yaml (atau sebaliknya) membuat tes ini gagal.
jest.mock('../../src/infrastructure/container', () =>
  require('../helpers/http').createContainerMock()
);

const container = require('../../src/infrastructure/container');
const { createServer, API_PREFIX } = require('../../src/server');
const { authHeader } = require('../helpers/http');
const {
  listOperations,
  listDocumentedResponses,
  assertMatchesSpec,
} = require('../helpers/openapi');
const NotFoundError = require('../../src/exceptions/NotFoundError');
const AuthenticationError = require('../../src/exceptions/AuthenticationError');
const UnauthorizedError = require('../../src/exceptions/UnauthorizedError');

const skill = {
  id: 1,
  name: 'Node.js',
  logoUrl: null,
  description: 'Runtime JavaScript',
  enabled: true,
  createdAt: new Date('2026-01-01T00:00:00Z'),
  updatedAt: new Date('2026-01-02T00:00:00Z'),
};
const socialMedia = {
  id: 1,
  platform: 'github',
  url: 'https://github.com/example',
  username: 'example',
  enabled: true,
};
const notFound = () => Promise.reject(new NotFoundError('Resource was not found.'));

const multipart = (type, sizeBytes = 10) => {
  const boundary = 'batas-kontrak';
  return {
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    payload: Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="logo"; filename="f"\r\n` +
          `Content-Type: ${type}\r\n\r\n`
      ),
      Buffer.alloc(sizeBytes, 'a'),
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]),
  };
};

// [method, routePath (sesuai openapi), url, opsi inject, setup mock]
const scenarios = [
  [
    'GET',
    '/health',
    '/health',
    {},
    () => container.checkHealth.execute.mockResolvedValue({ status: 'ok', database: 'ok' }),
  ],
  [
    'GET',
    '/health',
    '/health',
    {},
    () =>
      container.checkHealth.execute.mockResolvedValue({ status: 'error', database: 'unreachable' }),
  ],

  [
    'POST',
    '/admin/auth/login',
    '/admin/auth/login',
    { payload: { username: 'admin', password: 'x' } },
    () =>
      container.loginUser.execute.mockResolvedValue({
        accessToken: 't',
        expiresIn: 900,
        refreshToken: 'r',
        admin: { id: 1, username: 'admin' },
      }),
  ],
  ['POST', '/admin/auth/login', '/admin/auth/login', { payload: { username: 'admin' } }],
  [
    'POST',
    '/admin/auth/login',
    '/admin/auth/login',
    { payload: { username: 'admin', password: 'x' } },
    () =>
      container.loginUser.execute.mockRejectedValue(
        new AuthenticationError('Invalid username or password.')
      ),
  ],
  [
    'POST',
    '/admin/auth/refresh',
    '/admin/auth/refresh',
    { headers: { cookie: 'refresh_token=r' } },
    () =>
      container.refreshAccessToken.execute.mockResolvedValue({
        accessToken: 't',
        expiresIn: 900,
        refreshToken: 'r2',
      }),
  ],
  [
    'POST',
    '/admin/auth/refresh',
    '/admin/auth/refresh',
    {},
    () =>
      container.refreshAccessToken.execute.mockRejectedValue(
        new UnauthorizedError('Missing refresh token.')
      ),
  ],
  [
    'POST',
    '/admin/auth/logout',
    '/admin/auth/logout',
    { headers: { cookie: 'refresh_token=r' } },
    () => container.logoutUser.execute.mockResolvedValue(undefined),
  ],
  [
    'GET',
    '/admin/auth/me',
    '/admin/auth/me',
    { auth: true },
    () => container.getCurrentAdmin.execute.mockResolvedValue({ id: 1, username: 'admin' }),
  ],
  ['GET', '/admin/auth/me', '/admin/auth/me', {}],
  [
    'GET',
    '/skills',
    '/skills',
    {},
    () =>
      container.listSkills.execute.mockResolvedValue({
        data: [skill],
        meta: { page: 1, limit: 10, total: 1 },
      }),
  ],
  ['GET', '/skills', '/skills?limit=1000', {}],
  [
    'POST',
    '/skills',
    '/skills',
    { auth: true, payload: { name: 'Node.js' } },
    () => container.createSkill.execute.mockResolvedValue(skill),
  ],
  ['POST', '/skills', '/skills', { auth: true, payload: {} }],
  ['POST', '/skills', '/skills', { payload: { name: 'Node.js' } }],

  [
    'GET',
    '/skills/{id}',
    '/skills/1',
    {},
    () => container.getSkill.execute.mockResolvedValue(skill),
  ],
  ['GET', '/skills/{id}', '/skills/abc', {}],
  [
    'GET',
    '/skills/{id}',
    '/skills/99',
    {},
    () => container.getSkill.execute.mockImplementation(notFound),
  ],
  [
    'PUT',
    '/skills/{id}',
    '/skills/1',
    { auth: true, payload: { name: 'A', description: null, enabled: true } },
    () => container.updateSkill.execute.mockResolvedValue(skill),
  ],
  ['PUT', '/skills/{id}', '/skills/1', { auth: true, payload: { name: 'A' } }],
  [
    'PUT',
    '/skills/{id}',
    '/skills/1',
    { payload: { name: 'A', description: null, enabled: true } },
  ],
  [
    'PUT',
    '/skills/{id}',
    '/skills/99',
    { auth: true, payload: { name: 'A', description: null, enabled: true } },
    () => container.updateSkill.execute.mockImplementation(notFound),
  ],
  [
    'DELETE',
    '/skills/{id}',
    '/skills/1',
    { auth: true },
    () => container.deleteSkill.execute.mockResolvedValue(undefined),
  ],
  ['DELETE', '/skills/{id}', '/skills/abc', { auth: true }],
  ['DELETE', '/skills/{id}', '/skills/1', {}],
  [
    'DELETE',
    '/skills/{id}',
    '/skills/99',
    { auth: true },
    () => container.deleteSkill.execute.mockImplementation(notFound),
  ],

  [
    'POST',
    '/skills/{id}/logo',
    '/skills/1/logo',
    { auth: true, ...multipart('image/png') },
    () => container.uploadSkillLogo.execute.mockResolvedValue(skill),
  ],
  ['POST', '/skills/{id}/logo', '/skills/abc/logo', { auth: true, ...multipart('image/png') }],
  ['POST', '/skills/{id}/logo', '/skills/1/logo', multipart('image/png')],
  [
    'POST',
    '/skills/{id}/logo',
    '/skills/99/logo',
    { auth: true, ...multipart('image/png') },
    () => container.uploadSkillLogo.execute.mockImplementation(notFound),
  ],
  [
    'POST',
    '/skills/{id}/logo',
    '/skills/1/logo',
    { auth: true, ...multipart('image/png', 2 * 1024 * 1024 + 1) },
  ],
  ['POST', '/skills/{id}/logo', '/skills/1/logo', { auth: true, ...multipart('image/gif') }],

  [
    'GET',
    '/profile/social-media',
    '/profile/social-media',
    {},
    () => container.listSocialMedia.execute.mockResolvedValue([socialMedia]),
  ],
  [
    'GET',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    {},
    () => container.getSocialMediaByPlatform.execute.mockResolvedValue(socialMedia),
  ],
  ['GET', '/profile/social-media/{platform}', '/profile/social-media/myspace', {}],
  [
    'GET',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    {},
    () => container.getSocialMediaByPlatform.execute.mockImplementation(notFound),
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { enabled: false } },
    () => container.updateSocialMedia.execute.mockResolvedValue(socialMedia),
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { url: 'bukan url' } },
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { payload: { enabled: false } },
  ],
  [
    'PUT',
    '/profile/social-media/{platform}',
    '/profile/social-media/github',
    { auth: true, payload: { enabled: false } },
    () => container.updateSocialMedia.execute.mockImplementation(notFound),
  ],
];

describe('Kontrak docs/openapi.yaml', () => {
  let server;
  const exercised = new Set();

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('setiap route server terdokumentasi, dan setiap operasi di dokumen ada di server', () => {
    // ARRANGE
    const serverRoutes = server
      .table()
      .map((route) => `${route.method.toUpperCase()} ${route.path.replace(API_PREFIX, '')}`)
      .sort();

    // ASSERT
    expect(serverRoutes).toEqual(listOperations().sort());
  });

  it.each(scenarios.map((scenario) => [`${scenario[0]} ${scenario[2]}`, scenario]))(
    'respons %s cocok dengan skema',
    async (_title, [method, routePath, url, options, setup]) => {
      // ARRANGE
      setup?.();
      const { auth, headers = {}, payload } = options;

      // ACT
      const response = await server.inject({
        method,
        url: `${API_PREFIX}${url}`,
        headers: { ...headers, ...(auth ? authHeader() : {}) },
        payload,
      });
      exercised.add(`${method} ${routePath} ${response.statusCode}`);

      // ASSERT
      expect(() => assertMatchesSpec({ method, routePath, response })).not.toThrow();
    }
  );

  it('setiap status respons yang terdokumentasi pernah diuji', () => {
    // ASSERT
    const untested = listDocumentedResponses().filter((key) => !exercised.has(key));
    expect(untested).toEqual([]);
  });
});
