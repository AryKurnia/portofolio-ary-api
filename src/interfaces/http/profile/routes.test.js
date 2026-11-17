jest.mock('../../../infrastructure/container', () =>
  require('../../../../test/helpers/http').createContainerMock()
);

const container = require('../../../infrastructure/container');
const { createServer } = require('../../../server');
const { authHeader } = require('../../../../test/helpers/http');

describe('HTTP routes /api/v1/admin/profile', () => {
  let server;
  const profile = {
    greeting: "Hi, I'm Ary",
    tagline: 'a developer',
    about: 'Tentang saya',
    projectIntro: null,
    email: 'admin@example.com',
    updatedAt: new Date('2026-11-11T00:00:00Z'),
  };

  beforeAll(async () => {
    server = await createServer();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('GET mengembalikan profile snake_case dengan Cache-Control no-store', async () => {
    container.getProfile.execute.mockResolvedValue(profile);
    const response = await server.inject({
      method: 'GET',
      url: '/api/v1/admin/profile',
      headers: authHeader(),
    });
    expect(response.statusCode).toBe(200);
    expect(response.result.data).toEqual(
      expect.objectContaining({ project_intro: null, email: profile.email })
    );
    expect(response.headers['cache-control']).toBe('no-store');
  });

  it('GET tanpa token → 401', async () => {
    const response = await server.inject({ method: 'GET', url: '/api/v1/admin/profile' });
    expect(response.statusCode).toBe(401);
  });

  it('PATCH meneruskan hanya field yang dikirim, dalam camelCase', async () => {
    container.updateProfile.execute.mockResolvedValue(profile);
    const response = await server.inject({
      method: 'PATCH',
      url: '/api/v1/admin/profile',
      headers: authHeader(),
      payload: { project_intro: 'Intro baru' },
    });
    expect(response.statusCode).toBe(200);
    expect(container.updateProfile.execute).toHaveBeenCalledWith({
      greeting: undefined,
      tagline: undefined,
      about: undefined,
      projectIntro: 'Intro baru',
      email: undefined,
    });
  });

  it('PATCH menolak payload kosong', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url: '/api/v1/admin/profile',
      headers: authHeader(),
      payload: {},
    });
    expect(response.statusCode).toBe(400);
    expect(container.updateProfile.execute).not.toHaveBeenCalled();
  });

  it('PATCH menolak HTML dan teks terlalu panjang, dengan detail per field', async () => {
    const response = await server.inject({
      method: 'PATCH',
      url: '/api/v1/admin/profile',
      headers: authHeader(),
      payload: { about: '<script>alert(1)</script>', greeting: 'x'.repeat(81) },
    });
    expect(response.statusCode).toBe(400);
    expect(response.result.error.details).toEqual(
      expect.arrayContaining([
        { field: 'about', message: 'about must not contain HTML' },
        { field: 'greeting', message: expect.stringContaining('80') },
      ])
    );
  });

  it('PATCH men-trim spasi di awal/akhir teks', async () => {
    container.updateProfile.execute.mockResolvedValue(profile);
    await server.inject({
      method: 'PATCH',
      url: '/api/v1/admin/profile',
      headers: authHeader(),
      payload: { tagline: '  dev  ' },
    });
    expect(container.updateProfile.execute).toHaveBeenCalledWith(
      expect.objectContaining({ tagline: 'dev' })
    );
  });
});
